const express = require("express");

// Express Session
const expressSession = require("express-session")({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
});

// MongoDB
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
    done(null, user.username);
});

// Remove User from Session
passport.deserializeUser(function (username, done) {
    collection("users").findOne(
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
        // Search DB for user with username
        collection
            .findOne({ username: username })
            .then((user) => {
                // Test for correct username
                if (!user) {
                    console.error("Incorrect Username " + username);
                    return done(null, false, {
                        // TODO: Send errors to user
                        message: "Incorrect username",
                    });
                }
                (async () => {
                    console.log(await compareHash(username, password));
                })();

                // If username is correct, compare password hash
                // } else if (compareHash(username, password)) {
                //     return done(null, user);
                //   } else {
                //      return done(null, false, {
                //        message: "Incorrect password",
                //    });
            })
            .catch((err) => {
                console.error(err);
                return done(err);
            });
    })
);

// Password Hash Check
const compareHash = async (username, password) => {
    // Obtain user info and then user's hashed password
    collection
        .findOne({ username: username })
        .then(function (user) {
            const hash = user.password;
            return hash;
        })
        .then(async function (hash) {
            // Compare hashed password to typed password
            const passwordResult = await bcrypt.compare(password, hash, function (err, res) {
                if (res) {
                    return res;
                } else {
                    console.error("Password does not match");
                }
            });
            return passwordResult;
        })
        .catch((err) => {
            console.error("User doesn't exist" + err);
            return err;
        });
};

// Logged In Check Middleware
function isLoggedIn(req, res, next) {
    if (req.session.user !== undefined) {
        next();
    } else {
        console.log("User isn't logged in");
        res.redirect("/analytics/login");
    }
}

// Analytics Dashboard route
analyticsRouter.get("/", function (req, res) {
    res.send("Analytics root route");
});

// Login Routes

// Login Form
analyticsRouter.get("/login", function (req, res) {
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
