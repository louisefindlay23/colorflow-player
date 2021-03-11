const express = require("express");

// Deezer API
const DeezerPublicApi = require("deezer-public-api");
const deezer = new DeezerPublicApi();

const fs = require("fs");
const fetch = require("node-fetch");

// Parse Form Data
const bodyParser = require("body-parser");

// Parse URL Path
const urlModule = require("url");

// Color Modules
const { getColorFromURL } = require("color-thief-node");

// Initialise Spotify Router
const deezerRouter = express.Router();
deezerRouter.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
deezerRouter.use(bodyParser.json());

// Deezer Routes
deezerRouter.get("/", function (req, res) {
    res.render("pages/deezer/index");
});

deezerRouter.post("/search", function (req, res) {
    const searchQuery = req.body.searchbar;
    console.info("You searched for " + searchQuery);

    deezer.search(searchQuery).then((data) => {
        //console.log(data);
    });

    const obtainTrackResults = deezer.search.track(searchQuery).then((data) => {
        return data.data;
    });
    const obtainArtistResults = deezer.search.artist(searchQuery).then((data) => {
        return data.data;
    });
    const obtainPlaylistResults = deezer.search.playlist(searchQuery).then((data) => {
        return data.data;
    });

    const retrieveResults = async () => {
        const trackResults = await obtainTrackResults;
        const artistResults = await obtainArtistResults;
        const playlistResults = await obtainPlaylistResults;
        console.log(playlistResults[0]);
        res.render("pages/deezer/search-results", {
            searchQuery: searchQuery,
            trackResults: trackResults,
            artistResults: artistResults,
            playlistResults: playlistResults,
        });
    };
    retrieveResults();
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