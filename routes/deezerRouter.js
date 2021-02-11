const express = require("express");

// Deezer API
const DeezerPublicApi = require('deezer-public-api');
const deezer = new DeezerPublicApi();

// Deezer Router
const deezerRouter = express.Router();

// Root route
deezerRouter.get("/", function (req, res) {
    //Get album list for the given artist id
    deezer.artist.albums('58671252').then(function (result) {
        console.log(result);
    });
    res.render("pages/deezer/index");
});

module.exports = deezerRouter;
