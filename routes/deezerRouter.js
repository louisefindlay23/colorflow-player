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

        const artwork = result.cover;
        const albumname = result.title;
        const tracks = result.tracks.data
        console.log(tracks);
        const path = './public/img/image.png';
        download(artwork, path, () => {
            let color = colorThief.getColor(path);
            res.render('pages/deezer/album', {
                artwork: artwork,
                albumname: albumname,
                tracks: tracks,
                color: color
            });
        });
    }, function (err) {
        console.error(err);
    });
});

module.exports = deezerRouter;
