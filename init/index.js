const mongoose=require("mongoose");
const initData=require("./data.js");
const Listing=require("../models/listing.js");

main().then(()=>{
    console.log("connected")
}).catch((err)=>{
    console.log(err);
})

async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/willowsay');
}
const initDB= async()=>{
    await Listing.deleteMany({});
    const ownerId = new mongoose.Types.ObjectId("68cae74b7b12e6f02f3992e1"); 

    initData.data = initData.data.map((obj) => ({
        ...obj,
        owner: ownerId
    }));
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
}

initDB();