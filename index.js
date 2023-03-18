import * as cheerio from "cheerio";

// import { connectToDb, addAmenitiesData } from "./db";
import { getHtml } from "./scraper.js";

const DB_CONNECTION_STRING = "";

const citiesList = [
  {
    name: "Atlanta",
    url: "https://www.rentcafe.com/apartments-for-rent/us/ga/atlanta/?",
    pages: 1,
    lat: 33.791418,
    lng: -84.397917,
  },
  {
    name: "Dallas",
    url: "https://www.rentcafe.com/apartments-for-rent/us/tx/dallas/?",
    pages: 1,
    lat: 32.776664,
    lng: -96.796988,
  },
];

async function amenitiesFetch(cityItem) {
  const BASE_URL = cityItem.url;
  const pages = cityItem.pages;

  //   For each page
  for (let i = 1; i <= pages; i++) {
    const url = `${BASE_URL}page=${i}`;

    // Get the HTML of a page
    const html = await getHtml(url);
    const $ = cheerio.load(html);

    // Go into the apartment page
    const apartments = $(
      "li.listing-details div.listing-information div.listing-name-address h2 a"
    );
    const uniqueApartmentUrls = new Set();
    apartments.map((_, e) => {
      const link = e.attribs["href"];
      uniqueApartmentUrls.add(link);
    });
    const apartmentUrls = Array.from(uniqueApartmentUrls);

    // For each apartment
    for (let i = 0; i < apartmentUrls.length; i++) {
      const apartmentUrl = apartmentUrls[i];
      const data = await getAmenityData(apartmentUrl);

      await addAmenitiesData(data);
      // console.log(data);
    }

    //   Wait for 1 sec, so that server won't block us for making multiple requests
    await delay(1000);
  }
}

async function getAmenityData(url) {
  const html = await getHtml(url);
  const $ = cheerio.load(html);

  const [apartmentAmenities, communityAmenities] = [{}, {}];

  // Get property id
  const title = $("div.property-title-address-rating");
  const id = title[0].attribs["data-pid"];

  //   Get Apartment amenities
  const apartmentAmenityNodes = $("p.apartment-amenities-title+ul>li>div");
  apartmentAmenityNodes.map((_, e) => {
    const amenity = e.children[0].data.trim();
    apartmentAmenities[amenity] = true;
  });

  //   Get Community Amenities
  const communityAmenityNodes = $("p.community-amenities-title+ul>li>div");
  communityAmenityNodes.map((i, e) => {
    const amenity = e.children[0].data.trim();
    communityAmenities[amenity] = true;
  });

  return {
    id,
    apartmentAmenities,
    communityAmenities,
  };
}

function delay(milliSeconds) {
  return new Promise((resolve) => setTimeout(resolve, milliSeconds));
}

(async () => {
  try {
    // await connectToDb(DB_CONNECTION_STRING);

    amenitiesFetch(citiesList[0]);
  } catch (error) {
    console.log(error);
  }
})();
