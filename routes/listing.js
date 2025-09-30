const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const{isLoggedIn,isOwner,validateListing} =require("../middleware.js");
const controlllerListing=require("../controllers/listings.js");
const multer  = require('multer')
const {storage}=require("../cloudConfig.js");
const upload = multer({ storage})

// Index route + Search by country & Create route
router.route("/")
.get(wrapAsync (controlllerListing.index))
.post(isLoggedIn, validateListing, upload.single("listing[image]"), wrapAsync(controlllerListing.createListing));

// Create route
router.get("/new",isLoggedIn,controlllerListing.renderNewForm);

// Edit route
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(controlllerListing.editListing));

// Show route Update route Delete route
router.route("/:id")
.get( wrapAsync(controlllerListing.showListing))
.put( isLoggedIn,isOwner,upload.single("listing[image]"),validateListing, wrapAsync(controlllerListing.updateListing))
.delete(isLoggedIn,isOwner, wrapAsync(controlllerListing.deleteListing));

// Filter by type
router.get("/type/:type", wrapAsync(controlllerListing.filterByType));




module.exports=router;