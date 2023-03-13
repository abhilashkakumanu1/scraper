import axios from "axios";
import * as cheerio from "cheerio";

import { connectToDb, addAmenitiesData } from "./db";

const DB_CONNECTION_STRING = "";

const citiesList = [
  {
    name: "Atlanta",
    url: "https://www.rentcafe.com/apartments-for-rent/us/ga/atlanta/?",
    pages: 8,
    lat: 33.791418,
    lng: -84.397917,
  },
  {
    name: "Dallas",
    url: "https://www.rentcafe.com/apartments-for-rent/us/tx/dallas/?",
    pages: 8,
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
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    // Go into the apartment page
    const apartments = $("li.listing-details");
    const uniqueApartmentIds = new Set();
    apartments.map((_, e) => {
      const id = e.attribs["data-value"];
      uniqueApartmentIds.add(id);
    });
    const apartmentIds = Array.from(uniqueApartmentIds);

    // For each apartment
    for (let i = 0; i < apartmentIds.length; i++) {
      const apartmentId = apartmentIds[i];
      const data = await getAmenityData(apartmentId);

      await addAmenitiesData(apartmentId, data);
    }

    //   Wait for 1 sec, so that server won't block us for making multiple requests
    await delay(1000);
  }
}

async function getAmenityData(id) {
  const url = `https://www.rentcafe.com/Preview/Details/${id}`;
  const response = await axios.get(url);

  const html = response.data.data;
  const $ = cheerio.load(html);

  const [apartmentAmenities, communityAmenities] = [{}, {}];

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
    apartmentAmenities,
    communityAmenities,
  };
}

function delay(milliSeconds) {
  return new Promise((resolve) => setTimeout(resolve, milliSeconds));
}

(async () => {
  try {
    await connectToDb(DB_CONNECTION_STRING);

    amenitiesFetch(citiesList[0]);
  } catch (error) {
    console.log(error);
  }
})();
