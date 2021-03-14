const express = require("express");

// Express Session
const expressSession = require("express-session")({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
});

// DB
const dbInfo = require("../server");
const db = dbInfo;
console.log(db);

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
passport.use(
    new LocalStrategy(function (username, password, done) {
        db.collection("users").findOne(
            {
                username: username,
            },
            function (err, user) {
                if (err) {
                    console.error(err);
                    return done(err);
                }
                if (!user) {
                    console.log("Incorrect Username");
                    return done(null, false, {
                        message: "Incorrect username.",
                    });
                }
                bcrypt.compare(process.env.ANALYTICS_PASSWORD, hash, function (err, res) {
                    if (res) {
                        console.log("Login successful");
                        return done(null, user);
                    } else {
                        console.log("Incorrect password");
                        return done(null, false, {
                            message: "Incorrect username.",
                        });
                    }
                });
            }
        );
    })
);

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

analyticsRouter.get("/login", function (req, res) {
    //bcrypt.hash("Becomethemaster42!", 10, function (err, hash) {
    // Store hash
    //   console.log(hash);
    // });
    res.render("pages/analytics/login");
});

analyticsRouter.post("/login", function (req, res, next) {
    // Passport-Local Auth
    passport.authenticate("local", function (err, user) {
        if (err || user === false) {
            if (err) {
                console.error(err);
                res.redirect("/analytics/login");
            }
            res.redirect("/analytics/login");
        } else {
            req.logIn(user, function (err) {
                if (err) {
                    return next(err);
                }
                req.session.user = req.user;
                console.log("User is " + req.session.user.username);
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