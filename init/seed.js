require("dotenv").config(); 
const mongoose = require("mongoose");
const Listing = require("../models/listing");
const initData = require("./data");

const MONGO_URL = process.env.ATLASDB_URL;

async function main() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log(" Connected to MongoDB");

    await Listing.deleteMany({});

    const ownerId = new mongoose.Types.ObjectId("68d9d831507c576b13c64097");

    const listingsToInsert = initData.data.map((item) => ({
      ...item,
      owner: ownerId
    }));

    await Listing.insertMany(listingsToInsert);
    console.log(" Listings inserted!");

  } catch (err) {
    console.error(" Error:", err);
  } finally {
    mongoose.connection.close();
  }
}

main();
