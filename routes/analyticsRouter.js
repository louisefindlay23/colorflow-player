const express = require("express");

// Express Session
const expressSession = require("express-session")({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
});

// DB
const MongoClient = require("mongodb").MongoClient;
const dbUrl = process.env.DB_URL;
const client = new MongoClient(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });

// Passport
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

// Parse Form Data
const bodyParser = require("body-parser");

// Initialise Analytics Router
const analyticsRouter = express.Router();
analyticsRouter.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
analyticsRouter.use(bodyParser.json());

// Passport Session
analyticsRouter.use(passport.initialize());
analyticsRouter.use(passport.session());

// Add User to Session
passport.serializeUser(function (user, done) {
    done(null, user.username); /* Callback User from Database */
});

// Remove User from Session
passport.deserializeUser(function (username, done) {
    db.collection("users").findOne(
        {
            username: username,
        },
        function (err, user) {
            done(null, user);
        }
    );
});

// Authenticate user



// Hashing
function compareHash() {
    bcrypt.compare("somePassword", hash, function (err, res) {
        if (res) {
            // Passwords match
        } else {
            // Passwords don't match
        }
    });
}

// Logged In Check Middleware
function isLoggedIn(req, res, next) {
    if (req.session.user !== undefined) {
        next();
    } else {
        console.log("User isn't logged in");
        res.redirect("/analytics/login");
    }
}

// Login Routes

analyticsRouter.get("/", function (req, res) {
  client.connect(err => {
    const collection = client.db(process.env.DB_NAME).collection(process.env.DB_COLLECTION);
    collection.findOne({ username: "DarthAssessor" })
        .then(item => {
            console.log(item);
        }).catch(err => {
            console.error(err);
            return done(err);
        })
    });

});

analyticsRouter.get("/login", function (req, res) {
    //bcrypt.hash(process.env.ANALYTICS_PASSWORD, 10, function (err, hash) {
    //Store hash
    //    console.log(hash);
    // });
    res.render("pages/analytics/login");
});

// Passport-Local Auth
analyticsRouter.post("/login", function (req, res, next) {
    passport.authenticate("local", function (err, user) {
        if (err || user === false) {
            if (err) {
                console.error(err);
            }
            res.redirect("/analytics/login");
        } else {
            req.logIn(user, function (err) {
                console.info("Auth successful");
                if (err) {
                    return next(err);
                }
                req.session.user = req.user;
                console.info("User is " + req.session.user.username);
                return res.redirect("/analytics");
            });
        }
    })(req, res, next);
});

analyticsRouter.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/analytics/login");
});

module.exports = analyticsRouter;