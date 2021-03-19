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
        req.session.loginError = "You are not logged in";
        res.redirect("/analytics/login");
    }
}

// Analytics Routes

// Analytics Dashboard route
analyticsRouter.get("/", isLoggedIn, function (req, res) {
    // Get all session analytics from Mongo Session Store Collection
    sessionCollection.find({}).toArray(function (err, result) {
        if (err) {
            console.error(err);
        } else {
            // Create array to hold calculated totals
            let analyticsArray = [];
            let obj = {};
            // Create arrays to store the results of each analytic metric
            let totalPageViews = [];
            let totalHomeViews = [];
            let totalAnalyticsViews = [];
            let totalSpotifyViews = [];
            let totalDeezerViews = [];
            let totalSpotifyPlays = [];
            let totalDeezerPlays = [];
            // Push the results of every session for each metric to its own array
            result.forEach((result) => {
                const results = JSON.parse(result.session).analytics;
                totalPageViews.push(results[0].pageViews);
                totalHomeViews.push(results[0].homeViews);
                totalAnalyticsViews.push(results[0].analyticsViews);
                totalSpotifyViews.push(results[0].spotifyViews);
                totalDeezerViews.push(results[0].deezerViews);
                totalSpotifyPlays.push(results[0].spotifyPlays);
                totalDeezerPlays.push(results[0].deezerPlays);
            });
            // Reduce results (add) to get the total for each metric of all sessions
            obj.pageViews = totalPageViews.reduce((a, b) => a + b);
            obj.homeViews = totalHomeViews.reduce((a, b) => a + b);
            obj.analyticsViews = totalAnalyticsViews.reduce((a, b) => a + b);
            obj.spotifyViews = totalSpotifyViews.reduce((a, b) => a + b);
            obj.deezerViews = totalDeezerViews.reduce((a, b) => a + b);
            obj.spotifyPlays = totalSpotifyPlays.reduce((a, b) => a + b);
            obj.deezerPlays = totalDeezerPlays.reduce((a, b) => a + b);
            // Finally, push to the overall array to render to EJS template
            analyticsArray.push(obj);
            res.render("pages/analytics/index", {
                analyticsArray: analyticsArray,
            });
        }
    });
});

// Update Analytics route
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
                obj.deezerViews = obj.deezerViews + 1;
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

// Reset Analytics route
analyticsRouter.delete("/", function (req, res) {
    req.logout();
    req.session.destroy(function (err) {
        if (err) {
            req.session.loginError = "Error destroying session " + err;
        }
    });
    res.locals.loggedIn = false;
    sessionCollection
        .deleteMany({})
        .then((result) => {
            res.send({
                status: 200,
            });
        })
        .catch((err) => {
            console.error(err);
        });
});

// Register Routes

// Register Form
analyticsRouter.get("/register", function (req, res) {
    let error = null;
    // Show login errors to the user
    if (req.session.registerError) {
        error = req.session.registerError;
        delete req.session.registerError;
    }
    res.render("pages/analytics/register", { error: error });
});

// Register User
analyticsRouter.post("/register", function (req, res) {
    bcrypt.hash(req.body.password, 10, function (err, hash) {
        if (err) {
            req.session.registerError = "Error hashing password " + err;
            res.redirect("/analytics/register");
        } else {
            const user = { username: req.body.username, password: hash };
            userCollection.insertOne(user, function (err, result) {
                if (err) {
                    req.session.registerError = "Error inserting user into database " + err;
                } else {
                    res.redirect("/analytics/login");
                }
            });
        }
    });
});

// Login Routes

// Login Form
analyticsRouter.get("/login", function (req, res) {
    let error = null;
    // Show login errors to the user
    if (req.session.loginError) {
        error = req.session.loginError;
    }
    res.render("pages/analytics/login", { error: error });
    if (req.session.loginError) {
        delete req.session.loginError;
    }
});

// Passport-Local Auth
analyticsRouter.post("/login", function (req, res, next) {
    passport.authenticate("local", function (err, user, message) {
        if (err || user === false) {
            if (err) {
                req.session.loginError = "Error authenticating username " + err;
            }
            // Store login errors in a session object
            req.session.loginError = message.message;
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
            req.session.loginError = "Error destroying session " + err;
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

analyticsRouter.get("/delete-account", function (req, res) {
    const currentUser = { username: req.session.user.username };
    req.logout();
    req.session.destroy(function (err) {
        if (err) {
            req.session.registerError = "Error destroying session " + err;
        }
    });
    res.locals.loggedIn = false;
    userCollection.deleteOne(currentUser, function (err, result) {
        if (err) {
            console.error(err);
        } else {
            res.redirect("/analytics/register");
        }
    });
});

module.exports = analyticsRouter;
