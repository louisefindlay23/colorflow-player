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
passport.use(
    new LocalStrategy(function (username, password, done) {
client.connect(err => {
    const collection = client.db(process.env.DB_NAME).collection(process.env.DB_COLLECTION);
    // Search DB for user with username
    collection.findOne({ username: username })
        .then(user => {
            // Test for correct username
            if (!user) {
                console.error("Incorrect Username " + username);
                return done(null, false, {
                    // TODO: Send errors to user
                    message: "Incorrect username.",
                });
            // If username correct, compare password hash
            } else {
                compareHash(username, password);
            }
        }).catch(err => {
            console.error(err);
            return done(err);
        })
    });
})
);

// Hashing
function compareHash(username, password) {
    const collection = client.db(process.env.DB_NAME).collection(process.env.DB_COLLECTION);
    // Obtain user info and then user's hashed password
    collection.findOne({ username: username })
        .then(user => {
            const hash = user.password;
            // Compare hashed password to typed password
            bcrypt.compare(password, hash, function (err, res) {
                console.log("Entered password is " + password);
                console.log("Hashed password is " + hash);
                console.log(res);
                if (res) {
                    console.log(res);
                } else {
                    console.error("Password does not match " + err);
                }
            });
        }).catch(err => {
            console.error("User data doesn't exist" + err);
            return done(err);
        })
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
    res.send("Analytics root route");
});

analyticsRouter.get("/login", function (req, res) {
    const password = "process.env.ANALYTICS_PASSWORD";
    bcrypt.hash(password, 10, function (err, hash) {
        client.connect(err => {
            const collection = client.db(process.env.DB_NAME).collection(process.env.DB_COLLECTION);
        // Obtain user info and then update user's hashed password
        const userInfo = { name: process.env.ANALYTICS_USER };
    const updatePassword = { $set: {password: hash } };
        collection.updateOne(userInfo, updatePassword)
            .then(result => {
                console.log(result);
                // Compare hashed password to typed password
                const hash = user.password;
                bcrypt.compare(password, hash, function (err, res) {
                    console.log("Entered password is " + password);
                    console.log("Hashed password is " + hash);
                    console.log(res);
                    if (res) {
                        console.log(res);
                    } else {
                        console.error("Password does not match " + err);
                    }
                });
            }).catch(err => {
                console.error(err);
            });
        });
 });
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