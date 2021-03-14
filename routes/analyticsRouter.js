const express = require("express");

// Express Session
const expressSession = require("express-session")({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
});

// Passport
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

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
                    console.log(err);
                    return done(err);
                }
                if (!user) {
                    console.log("Incorrect Username");
                    return done(null, false, {
                        message: "Incorrect username.",
                    });
                }
                if (user.password != password) {
                    console.log("Incorrect Password");
                    return done(null, false, {
                        message: "Incorrect password.",
                    });
                }
                return done(null, user);
            }
        );
    })
);

// Hashing

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
    res.send("Login page");
});

analyticsRouter.post("/login", function (req, res, next) {
    // Passport-Local Auth
    passport.authenticate("local", function (err, user) {
        if (err || user === false) {
            if (err) {
                console.log(err);
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