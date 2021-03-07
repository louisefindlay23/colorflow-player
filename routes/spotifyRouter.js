const express = require("express");

// Spotify API
const SpotifyWebApi = require("spotify-web-api-node");
var credentials = {
    redirectUri: process.env.REDIRECT_URI,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
};

const spotifyApi = new SpotifyWebApi(credentials);

const fs = require("fs");
const request = require("request");

// Parse Form Data
const bodyParser = require("body-parser");

// Parse URL Path
const urlModule = require("url");

// Download Files
const download = (url, path, callback) => {
    request.head(url, (err, res, body) => {
        request(url).pipe(fs.createWriteStream(path)).on("close", callback);
    });
};

// Initialise Spotify Router
const spotifyRouter = express.Router();
spotifyRouter.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
spotifyRouter.use(bodyParser.json());

function isAuthenticated(req, res, next) {
    if (spotifyApi.getAccessToken() == null) {
        console.warn("You are not authenticated with the Spotify API");
        res.redirect("/spotify/login");
    } else {
        return next();
    }
}

// Spotify Routes
spotifyRouter.get("/", isAuthenticated, function (req, res) {
    res.render("pages/spotify/index");
});

spotifyRouter.get("/login", function (req, res) {
    res.redirect(
        "https://accounts.spotify.com/authorize?client_id=" +
            process.env.CLIENT_ID +
            "&response_type=code&redirect_uri=" +
            process.env.REDIRECT_URI +
            "&scope=user-read-private%20user-read-email&state=some-state-of-my-choice"
    );
});

spotifyRouter.get("/callback", function (req, res) {
    const code = req.query.code;
    spotifyApi.authorizationCodeGrant(code).then(
        function (data) {
            // Set the access token on the API object to use it in later calls
            spotifyApi.setAccessToken(data.body["access_token"]);
            spotifyApi.setRefreshToken(data.body["refresh_token"]);
            const referrer = req.get("Referrer");
            let referrerpath = urlModule.parse(referrer, true);
            referrerpath = referrerpath.path;
            if (referrerpath === "/") {
                res.redirect("/spotify");
            } else {
                res.redirect(referrerpath);
            }
        },
        function (err) {
            console.error("Authentication Error", err);
        }
    );
});

// Search Route
spotifyRouter.post("/search", isAuthenticated, function (req, res) {
    const searchType = req.body.searchtype;
    const searchQuery = req.body.searchbar;
    console.info("You searched for " + searchQuery);

    const obtainTrackResults = spotifyApi.searchTracks(searchQuery).then((data) => {
        return data.body.tracks.items;
    });
    const obtainArtistResults = spotifyApi.searchArtists(searchQuery).then((data) => {
        return data.body.artists.items;
    });
    const obtainPlaylistResults = spotifyApi.searchPlaylists(searchQuery).then((data) => {
        return data.body.playlists.items;
    });

    const retrieveResults = async () => {
        const trackResults = await obtainTrackResults;
        const artistResults = await obtainArtistResults;
        const playlistResults = await obtainPlaylistResults;
        res.render("pages/spotify/search-results", {
            searchQuery: searchQuery,
            trackResults: trackResults,
            artistResults: artistResults,
            playlistResults: playlistResults,
        });
    };
    retrieveResults();
});

spotifyRouter.get("/album/:id", isAuthenticated, function (req, res) {
    spotifyApi.getAlbum(req.params.id).then(
        function (data) {
            let artwork = data.body.images[0].url;
            if (artwork === null) {
                artwork = "./public/img/fallback-imgs/fallback-album.jpg";
            }
            const albumInfo = data.body;

            // TODO: Use album name to save/cache analysed artwork and send to front-end
            const path = "./public/img/analysed-artwork/.png";

            download(artwork, path, () => {
                const { getColorFromURL } = require("color-thief-node");

                (async () => {
                    const color = await getColorFromURL(imageURL);
                })();

                res.render("pages/spotify/album", {
                    artwork: artwork,
                    albumInfo: albumInfo,
                    color: color,
                });
            });
        },
        function (err) {
            console.error("Get Album Info error", err);
        }
    );
});

spotifyRouter.get("/artist/:id", isAuthenticated, function (req, res) {
    // TODO: Dynamic artist image background
    const obtainArtistInfo = spotifyApi.getArtist(req.params.id).then((data) => {
        return data.body;
    });
    const obtainArtistAlbumInfo = spotifyApi.getArtistAlbums(req.params.id).then((data) => {
        return data.body.items;
    });

    const retrieveInfo = async () => {
        const artistInfo = await obtainArtistInfo;
        const albumInfo = await obtainArtistAlbumInfo;
        res.render("pages/spotify/artist", {
            artistInfo: artistInfo,
            albumInfo: albumInfo,
        });
    };
    retrieveInfo();
});

spotifyRouter.get("/playlist/:id", isAuthenticated, function (req, res) {
    // TODO: Dynamic playlist image background? - Most playlists are multi album art
    const obtainPlaylistInfo = spotifyApi.getPlaylist(req.params.id).then((data) => {
        return data.body;
    });
    const obtainPlaylistTrackInfo = spotifyApi
        .getPlaylistTracks(req.params.id, {
            limit: 30,
            fields: "items",
        })
        .then((data) => {
            return data.body.items;
        });

    const retrieveInfo = async () => {
        const playlistInfo = await obtainPlaylistInfo;
        const playlistTrackInfo = await obtainPlaylistTrackInfo;
        console.log(playlistTrackInfo[0].track.artists[0].id);
        res.render("pages/spotify/playlist", {
            playlistInfo: playlistInfo,
            playlistTrackInfo: playlistTrackInfo,
        });
    };
    retrieveInfo();
});

module.exports = spotifyRouter;