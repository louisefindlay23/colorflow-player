// Live reload Static Files
const livereload = require("livereload");
const path = require("path");
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, "public"));
const connectLivereload = require("connect-livereload");

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
app.listen(port);
console.log("Listening on " + port);

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