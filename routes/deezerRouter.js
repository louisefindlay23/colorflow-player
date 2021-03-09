const express = require("express");

// Deezer API
const DeezerPublicApi = require("deezer-public-api");
const deezer = new DeezerPublicApi();

// Deezer Router
const deezerRouter = express.Router();

const fs = require("fs");
const request = require("request");

// Download Files
const download = (url, path, callback) => {
    request.head(url, (err, res, body) => {
        request(url).pipe(fs.createWriteStream(path)).on("close", callback);
    });
};

// Color Modules
const { getColorFromURL } = require("color-thief-node");

// Root route
deezerRouter.get("/", function (req, res) {
    res.render("pages/deezer/index");
});

deezerRouter.get("/album", function (req, res) {
    deezer.album("86103822").then(
        function (result) {
            const artwork = result.cover;
            const albumname = result.title;
            const tracks = result.tracks.data;
            console.log(tracks);
            // TODO: Create Spotify and Deezer subfolder under analysed-artwork
            const path = "./public/img/analysed-artwork/album/86103822.jpg";
            download(artwork, path, () => {
                console.info("Image does exist -> Get Color");
                // Get color and then render album page
                const retrieveColor = async () => {
                    const color = await getColorFromURL(path);
                    res.render("pages/deezer/album", {
                        artwork: artwork,
                        albumname: albumname,
                        tracks: tracks,
                        color: color,
                    });
                };
                retrieveColor();
            });
        },
        function (err) {
            console.error(err);
        }
    );
});

module.exports = deezerRouter;