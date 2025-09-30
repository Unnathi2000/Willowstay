const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync.js");
const {validateReview,isLoggedIn,isReviewAuthor} =require("../middleware.js");
const controllerReview=require("../controllers/reviews.js");

// Post 
router.post("/",isLoggedIn, validateReview, wrapAsync(controllerReview.createReview));

// delete
router.delete("/:reviewId",isLoggedIn,isReviewAuthor, wrapAsync(controllerReview.deleteReview));

module.exports=router;