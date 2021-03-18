const express = require("express");

// Connect to MongoDB
const { MongoClient } = require("mongodb");
const mongo = new MongoClient(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
let collection = null;

mongo.connect((err, result) => {
    collection = result.db(process.env.DB_NAME).collection(process.env.DB_COLLECTION);

    process.on("SIGINT", function () {
        mongo.close();
    });
});

// Passport and Authentication Modules
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
const bcrypt = require("bcrypt");

// Parsing Modules
const bodyParser = require("body-parser");
const url = require("url");

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
    done(null, user.username);
});

// Remove User from Session
passport.deserializeUser(function (req, username, done) {
    collection.findOne(
        {
            username: username,
        },
        function (err, user) {
            if (err) {
                req.session.destroy(function () {
                    return done(err, user, {
                        message: "Error logging out " + err,
                    });
                });
            }
            done(null, user);
        }
    );
});

// Authenticate user
passport.use(
    new LocalStrategy(function (username, password, done) {
        // Search DB for user with username
        collection
            .findOne({ username: username })
            .then((user) => {
                // Test for correct username
                if (!user) {
                    return done(null, false, {
                        message: "Incorrect username",
                    });
                }
                // If username is correct, compare password hash
                collection
                    .findOne({ username: username })
                    .then(function (user) {
                        const hash = user.password;
                        return hash;
                    })
                    .then(function (hash) {
                        // Compare hashed password to typed password
                        bcrypt.compare(password, hash, function (err, res) {
                            if (res) {
                                return done(null, user);
                            } else {
                                return done(null, false, {
                                    message: "Incorrect password",
                                });
                            }
                        });
                    })
                    .catch((err) => {
                        return done(err, null, {
                            message: "Error authenticating password " + err,
                        });
                    });
            })
            .catch((err) => {
                return done(err, null, {
                    message: "Error searching for user " + err,
                });
            });
    })
);

// Logged In Check Middleware
function isLoggedIn(req, res, next) {
    if (req.session.user !== undefined) {
        next();
    } else {
        req.session.error = "You are not logged in";
        res.redirect("/analytics/login");
    }
}

// Analytics Dashboard route
analyticsRouter.get("/", isLoggedIn, function (req, res) {
    const pageViews = req.session.pageViews;
    const homeViews = req.session.homeViews;
    const analyticsViews = req.session.analyticsViews;
    const spotifyViews = req.session.spotifyViews;
    const deezerViews = req.session.deezerViews;
    console.info(deezerViews);
    res.render("pages/analytics/index", {
        pageViews: pageViews,
        homeViews: homeViews,
        analyticsViews: analyticsViews,
        spotifyViews: spotifyViews,
        deezerViews: deezerViews,
    });
});

// Page View Counter
analyticsRouter.post("/page-views", function (req, res) {
    // Passport Session Analytics
    req.session.pageViews = req.session.pageViews || 0;
    req.session.homeViews = req.session.homeViews || 0;
    req.session.analyticsViews = req.session.analyticsViews || 0;
    req.session.spotifyViews = req.session.spotifyViews || 0;
    req.session.deezerViews = req.session.deezerViews || 0;
    // Global Page Views
    req.session.pageViews = req.session.pageViews + 1;
    // Get referrer
    const referrer = req.get("Referrer");
    if (referrer) {
        let referrerpath = url.parse(referrer, true);
        referrerpath = referrerpath.path;
        // Homepage Views
        if (referrerpath === "/") {
            req.session.homeViews = req.session.homeViews + 1;
            // Analytics Page Views
        } else if (referrerpath.includes("/analytics")) {
            req.session.analyticsViews = req.session.analyticsViews + 1;
            // Spotify Page Views
        } else if (referrerpath.includes("/spotify")) {
            req.session.spotifyViews = req.session.spotifyViews + 1;
            // Deezer Page Views
        } else if (referrerpath.includes("/deezer")) {
            req.session.deezerViews = req.session.deezerViews + 1;
        }
    }
    res.send({
        status: 200,
    });
});

// Login Routes

// Login Form
analyticsRouter.get("/login", function (req, res) {
    let error = null;
    // Show login errors to the user
    if (req.session.error) {
        error = req.session.error;
    }
    res.render("pages/analytics/login", { error: error });
    if (req.session.error) {
        delete req.session.error;
    }
});

// Passport-Local Auth
analyticsRouter.post("/login", function (req, res, next) {
    passport.authenticate("local", function (err, user, message) {
        if (err || user === false) {
            if (err) {
                req.session.error = "Error authenticating username " + err;
            }
            // Store login errors in a session object
            req.session.error = message.message;
            res.redirect("/analytics/login");
        } else {
            req.logIn(user, function (err) {
                if (err) {
                    return next(err);
                }
                req.session.user = req.user;
                return res.redirect("/analytics");
            });
        }
    })(req, res, next);
});

analyticsRouter.get("/logout", function (req, res) {
    req.logout();
    req.session.destroy(function (err) {
        if (err) {
            req.session.error = "Error destroying session " + err;
            res.redirect("/analytics/login");
        }
    });
    res.locals.loggedIn = false;
    // Redirect to referrer unless on Analytics page
    const referrer = req.get("Referrer");
    if (referrer) {
        let referrerpath = url.parse(referrer, true);
        referrerpath = referrerpath.path;
        if (referrerpath === "/analytics") {
            referrerpath = "/analytics";
        }
        res.redirect(referrerpath);
    } else {
        res.redirect("/analytics/login");
    }
});

module.exports = analyticsRouter;
