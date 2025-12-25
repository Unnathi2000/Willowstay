const mongoose = require("mongoose");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: __dirname + "/../.env" });
}
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

main().then(() => {
    console.log("connected");
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

const initDB = async () => {
    await Listing.deleteMany({});
    const ownerId = new mongoose.Types.ObjectId("68cae74b7b12e6f02f3992e1"); // unnathi

    for (let obj of initData.data) {
        const geoData = await geocodingClient.forwardGeocode({
            query: obj.location,
            limit: 1
        }).send();

        const listing = new Listing({
            ...obj,
            owner: ownerId,
            geometry: geoData.body.features[0].geometry
        });

        await listing.save();
        console.log(`Saved: ${obj.title}`);
    }

    console.log("data was initialized with geometry");
};

initDB();
