if(process.env.NODE_ENV != "production"){
    require('dotenv').config()
}

const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const expressError=require("./utils/expressError.js");

const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");

const session=require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");

const passport=require("passport");
const LocalStratergy=require("passport-local");
const User=require("./models/user.js");

const dbUrl= process.env.ATLASDB_URL;


app.set("view engine", "ejs");
app.set("views" ,path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"public")));

async function main(){
    if (!dbUrl) {
        throw new Error("ATLASDB_URL is required. Set it in Render's environment variables.");
    }
    if (!process.env.SECRET) {
        throw new Error("SECRET is required for sessions.");
    }
    await mongoose.connect(dbUrl);
    console.log("connected");


    const store= MongoStore.create({
        client:mongoose.connection.getClient(),
        dbName:mongoose.connection.name,
       crypto : {
         secret:process.env.SECRET,
       },
       touchAfter:24*60*60,
    })

    store.on("error", (err)=>{
        console.error("Error in mongo session store", err.message);
    })
    await store.collectionP;

    const sessionOptions={
        store:store,
        secret:process.env.SECRET,
        resave:false,
        saveUninitialized:true,
        cookie:{
            expires: Date.now()+ 7*24*60*60*1000,
            maxAge:7*24*60*60*1000,
            httpOnly:true
        },
    }


    app.use(session(sessionOptions));
    app.use(flash());

    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(new LocalStratergy(User.authenticate()));

    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());


    app.use((req,res,next)=>{
        res.locals.success=req.flash("success");
        res.locals.error=req.flash("error");
        res.locals.curUser=req.user;
        next();
    })


    app.use("/listings",listingRouter);
    app.use("/listings/:id/reviews", reviewRouter);
    app.use("/",userRouter);


    // default errormessage for all unavailable pages
    app.all(/.*/, (req, res, next) => {
        next(new expressError(404, "Page not found"));
    });

    // error handler middleware
    app.use((err,req,res,next)=>{
        let {status=500,message="Something went wrong"}=err;
        res.status(status).render("listings/error.ejs",{message});
        // res.status(status).send(message);
    })

    const port=process.env.PORT || 8080;
    app.listen(port, "0.0.0.0", ()=>{
        console.log(`listening to port ${port}`);
    })
}

main().catch(async (err)=>{
    console.error("Application startup failed:", err.message);
    if (err.code === "ENOTFOUND" && err.syscall === "querySrv") {
        console.error("Check that your Atlas cluster is active and ATLASDB_URL matches its current connection string.");
    }
    process.exitCode=1;
    await mongoose.disconnect();
});
