const express = require("express");

// Deezer API
const DeezerPublicApi = require('deezer-public-api');
const deezer = new DeezerPublicApi();

// Deezer Router
const deezerRouter = express.Router();

// Colour Modules
const ColorThief = require('color-thief');
const colorThief = new ColorThief();

const fs = require('fs');
const request = require('request');

// Download Files
const download = (url, path, callback) => {
    request.head(url, (err, res, body) => {
        request(url)
            .pipe(fs.createWriteStream(path))
            .on('close', callback);
    });
};

// Root route
deezerRouter.get("/", function (req, res) {
    res.render("pages/deezer/index");
});

deezerRouter.get("/album", function (req, res) {
    deezer.album('86103822').then(function (result) {

        let artworkurl = result.cover;
        const track = result.tracks.data[0]
        const path = './public/img/image.png';
        download(artworkurl, path, () => {
            let color = colorThief.getColor(path);
            console.log("RGB Colour is " + color);
            res.render('pages/deezer/album', {
                artworkurl: artworkurl,
                track: track,
                color: color
            });
        });
    }, function (err) {
        console.error(err);
    });
});

module.exports = deezerRouter;
