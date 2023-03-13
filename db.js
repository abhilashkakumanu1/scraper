import mongoose from "mongoose";

export const connectToDb = async (connectionString) => {
  return new Promise(async (resolve, reject) => {
    // Set up database connection with MongoDB
    // and wait for the connection
    const db = mongoose.connection;
    const timeout = 2000;

    db.on("error", function (error) {
      console.error("Error in MongoDb connection: " + error);
      mongoose.disconnect();
    });
    db.on("connected", function () {
      console.log("Database connected.");
      resolve(null);
    });
    db.on("reconnected", function () {
      console.log("MongoDB reconnected!");
    });
    db.on("disconnected", function () {
      console.log("MongoDB disconnected!");
      setTimeout(async () => await mongoose.connect(connectionString), timeout);
    });
    await mongoose.connect(connectionString);
  });
};

export const addAmenitiesData = async (id, rcAmenities) => {
  // TODO: Update this with real model
  // Property mongoose model
  const Property = {};

  // Get property
  const property = await Property.findOne({ "propertyData.rcId": id });
  console.log(property);

  // add amenity data
  property.set({
    "propertyData.rcAmenities": rcAmenities,
  });
  await property.save();
};
