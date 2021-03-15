// Server Modules
const express = require("express");
const ejs = require("ejs");
const app = express();
const port = 3000;

require("dotenv").config();

// Initialising Express
app.use(express.static("public"));
// set the view engine to ejs
app.set("view engine", "ejs");

// Run server
app.listen(process.env.PORT);
console.log("Listening on " + process.env.PORT);

// Live reload Static Files
if (process.env.NODE_ENV === "development") {
    const livereload = require("livereload");
    const options = {
        port: process.env.RELOAD_PORT,
    };
    const liveReloadServer = livereload.createServer(options);
    const path = require("path");
    liveReloadServer.watch(path.join(__dirname, "public"));
    const connectLivereload = require("connect-livereload");
    // Setup Live Reload
    liveReloadServer.server.once("connection", () => {
        setTimeout(() => {
            liveReloadServer.refresh("/");
        }, 100);
    });
    app.use(connectLivereload());
}

// Root Route
app.get("/", function (req, res) {
    res.render("pages/index");
});

// Spotify Routes
const spotifyRoutes = require("./routes/spotifyRouter");
app.use("/spotify", spotifyRoutes);

// Deezer Routes
const deezerRoutes = require("./routes/deezerRouter");
app.use("/deezer", deezerRoutes);

// Analytics Routes
const analyticsRoutes = require("./routes/analyticsRouter");
app.use("/analytics", analyticsRoutes);

// 404 Route
app.use(function (req, res) {
    res.status(404).render("pages/404");
});
