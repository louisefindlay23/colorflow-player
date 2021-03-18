const express = require("express");

// Connect to MongoDB
const { MongoClient } = require("mongodb");
const mongo = new MongoClient(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
let userCollection = null;
let sessionCollection = null;

mongo.connect((err, result) => {
    userCollection = result.db(process.env.DB_NAME).collection(process.env.DB_USER_COLLECTION);
    sessionCollection = result.db(process.env.DB_NAME).collection(process.env.DB_SESSION_COLLECTION);

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
    userCollection.findOne(
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
        userCollection
            .findOne({ username: username })
            .then((user) => {
                // Test for correct username
                if (!user) {
                    return done(null, false, {
                        message: "Incorrect username",
                    });
                }
                // If username is correct, compare password hash
                userCollection
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

// Analytics Routes

// Analytics Dashboard route
analyticsRouter.get("/", isLoggedIn, function (req, res) {
    // Current Session Analytics
    const currentAnalytics = req.session.analytics[0];
    // All Sessions Analytics
    sessionCollection.find({}).toArray(function (err, result) {
        if (err) {
            console.error(err);
        } else {
            result.forEach((result) => {
                const allAnalytics = JSON.parse(result.session).analytics;
                res.render("pages/analytics/index", {
                    currentAnalytics: currentAnalytics,
                    allAnalytics: allAnalytics,
                });
            });
        }
    });
});

// Add analytics route
analyticsRouter.post("/", function (req, res) {
    // Passport Session Analytics
    if (!req.session.analytics || !req.session.analytics[0]) {
        req.session.analytics = [
            {
                pageViews: 0,
                homeViews: 0,
                analyticsViews: 0,
                spotifyViews: 0,
                deezerViews: 0,
                spotifyPlays: 0,
                deezerPlays: 0,
            },
        ];
    }
    const obj = {};
    obj.pageViews = req.session.analytics[0].pageViews || 0;
    obj.homeViews = req.session.analytics[0].homeViews || 0;
    obj.analyticsViews = req.session.analytics[0].analyticsViews || 0;
    obj.spotifyViews = req.session.analytics[0].spotifyViews || 0;
    obj.deezerViews = req.session.analytics[0].deezerViews || 0;
    obj.spotifyPlays = req.session.analytics[0].spotifyPlays || 0;
    obj.deezerPlays = req.session.analytics[0].deezerPlays || 0;
    // Add Page Views
    if (req.body.pageView) {
        // Global Page Views
        obj.pageViews = obj.pageViews + 1;
        // Get referrer to increase page views by type
        const referrer = req.get("Referrer");
        if (referrer) {
            let referrerpath = url.parse(referrer, true);
            referrerpath = referrerpath.path;
            if (referrerpath === "/") {
                obj.homeViews = obj.homeViews + 1;
            } else if (referrerpath.includes("/analytics")) {
                obj.analyticsViews = obj.analyticsViews + 1;
            } else if (referrerpath.includes("/spotify")) {
                obj.spotifyViews = obj.spotifyViews + 1;
            } else if (referrerpath.includes("/deezer")) {
                obj.deezerViews = req.session.analytics.deezerViews + 1;
            }
        }
        // Add song plays
    } else if (req.body.songPlay) {
        const referrer = req.get("Referrer");
        if (referrer) {
            let referrerpath = url.parse(referrer, true);
            referrerpath = referrerpath.path;
            if (referrerpath.includes("/spotify")) {
                obj.spotifyPlays = obj.spotifyPlays + 1;
            } else if (referrerpath.includes("/deezer")) {
                obj.deezerPlays = obj.deezerPlays + 1;
            }
        }
    }
    req.session.analytics.pop();
    req.session.analytics.push(obj);

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
