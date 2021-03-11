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

// Initialise Deezer Router
const deezerRouter = express.Router();
deezerRouter.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
deezerRouter.use(bodyParser.json());

// Download Files Function
async function download(url, path) {
    const response = await fetch(url);
    const buffer = await response.buffer();
    fs.writeFile(path, buffer, () => console.info("File Downloaded ✅"));
}

// Deezer Routes
deezerRouter.get("/", function (req, res) {
    res.render("pages/deezer/index");
});

// Search redirect
deezerRouter.get("/search", function (req, res) {
    res.redirect("/deezer");
});

// Search Route
deezerRouter.post("/search", function (req, res) {
    const searchQuery = req.body.searchbar;
    console.info("You searched for " + searchQuery);

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
        res.render("pages/deezer/search-results", {
            searchQuery: searchQuery,
            trackResults: trackResults,
            artistResults: artistResults,
            playlistResults: playlistResults,
        });
    };
    retrieveResults();
});

// Deezer Media Routes
deezerRouter.get("/album/:id", function (req, res) {
    deezer.album(req.params.id).then(function (data) {
        let artwork = data.cover_big;
        if (artwork === null) {
            artwork =
                "https://raw.githubusercontent.com/louisefindlay23/colorflow-player/test/public/img/fallback-imgs/fallback-album.jpg";
        }
        const albumInfo = data;
        const path = "./public/img/analysed-artwork/deezer/album/" + req.params.id + ".png";

        // Check if already downloaded album image. If not, download it.
        fs.access(path, fs.F_OK, (err) => {
            if (err) {
                console.error(err);
                console.info("Image does not exist -> Downloading");
                // Download album image to get colour
                const retrieveArtwork = async () => {
                    await download(artwork, path);
                    res.redirect("/deezer" + req.url);
                };
                retrieveArtwork();
            } else {
                console.info("Image does exist -> Get Color");
                // Get color and then render album page
                const retrieveColor = async () => {
                    const color = await getColorFromURL(path);
                    res.render("pages/deezer/album", {
                        albumInfo: albumInfo,
                        color: color,
                    });
                };
                retrieveColor();
            }
        });
    }),
        function (err) {
            console.error("Get Album Info error", err);
        };
});

deezerRouter.get("/artist/:id", function (req, res) {
    const obtainArtistInfo = deezer.artist(req.params.id).then((data) => {
        return data;
    });
    const obtainArtistAlbumInfo = deezer.artist.albums(req.params.id).then((data) => {
        console.log(data.data[0]);
        return data.data;
    });

    const retrieveArtwork = async () => {
        let artwork = await obtainArtistInfo;
        if (artwork.picture_big) {
            artwork = artwork.picture_big;
        } else {
            artwork =
                "https://raw.githubusercontent.com/louisefindlay23/colorflow-player/test/public/img/fallback-imgs/fallback-artist.png";
        }
        const path = "./public/img/analysed-artwork/deezer/artist/" + req.params.id + ".png";
        // Check if already downloaded artist image. If not, download it.
        fs.access(path, fs.F_OK, (err) => {
            if (err) {
                console.error(err);
                console.info("Image does not exist -> Downloading");
                // Download artist image to get colour
                const retrieveArtwork = async () => {
                    await download(artwork, path);
                    res.redirect("/deezer" + req.url);
                };
                retrieveArtwork();
            } else {
                console.info("Image does exist -> Get Color");
                // Get info and then render artist page
                const retrieveInfo = async () => {
                    const artistInfo = await obtainArtistInfo;
                    const albumInfo = await obtainArtistAlbumInfo;
                    const color = await getColorFromURL(path);
                    res.render("pages/deezer/artist", {
                        artistInfo: artistInfo,
                        albumInfo: albumInfo,
                        color: color,
                    });
                };
                retrieveInfo();
            }
        });
    };
    retrieveArtwork();
});

deezerRouter.get("/playlist/:id", function (req, res) {
    const obtainPlaylistInfo = deezer.playlist(req.params.id).then((data) => {
        console.log(data);
        return data;
    });
    const obtainPlaylistTrackInfo = deezer.playlist
        .tracks(req.params.id, {
            limit: 30,
        })
        .then((data) => {
            return data;
        });

    const retrieveArtwork = async () => {
        let artwork = await obtainPlaylistInfo;
        if (artwork.picture_big) {
            artwork = artwork.picture_big;
        } else {
            artwork =
                "https://raw.githubusercontent.com/louisefindlay23/colorflow-player/test/public/img/fallback-imgs/fallback-album.jpg";
        }
        const path = "./public/img/analysed-artwork/deezer/playlist/" + req.params.id + ".png";
        // Check if already downloaded playlist image. If not, download it.
        fs.access(path, fs.F_OK, (err) => {
            if (err) {
                console.error(err);
                console.info("Image does not exist -> Downloading");
                // Download playlist image to get colour
                const retrieveArtwork = async () => {
                    await download(artwork, path);
                    res.redirect("/spotify" + req.url);
                };
                retrieveArtwork();
            } else {
                console.info("Image does exist -> Get Color");
                // Get info and then render playlist page
                const retrieveInfo = async () => {
                    const playlistInfo = await obtainPlaylistInfo;
                    const playlistTrackInfo = await obtainPlaylistTrackInfo;
                    const color = await getColorFromURL(path);
                    res.render("pages/spotify/playlist", {
                        playlistInfo: playlistInfo,
                        playlistTrackInfo: playlistTrackInfo,
                        color: color,
                    });
                };
                retrieveInfo();
            }
        });
    };
    retrieveArtwork();
});

module.exports = deezerRouter;