// Live reload Static Files
const livereload = require("livereload");
const path = require('path');
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, 'public'));
const connectLivereload = require("connect-livereload");

// Server Modules
const express = require('express');
const ejs = require('ejs');
const app = express();

require('dotenv').config();

// Initialising Express
app.use(express.static('public'));
// set the view engine to ejs
app.set('view engine', 'ejs');

app.listen(8080);
console.log('Listening on 8080');

// *** GET Routes - display pages ***

// Root Route
app.get("/", function (req, res) {
    res.render("pages/index");
});

// Spotify Routes
const spotifyRoutes = require("./routes/spotifyRouter");
app.use("/spotify", spotifyRoutes);

// Apple Music Player
