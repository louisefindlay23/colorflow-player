const express = require("express");

// Spotify API
const SpotifyWebApi = require("spotify-web-api-node");
var credentials = {
    redirectUri: process.env.REDIRECT_URI,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
};
const spotifyApi = new SpotifyWebApi(credentials);
let tokenExpiration = null;

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

// Color Modules
const { getColorFromURL } = require("color-thief-node");

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
            // Get Access Token, redirect and store expiry time
            spotifyApi.setAccessToken(data.body["access_token"]);
            spotifyApi.setRefreshToken(data.body["refresh_token"]);
            tokenExpiration = data.body["expires_in"];
            tokenExpiration = parseInt(tokenExpiration);
            runSpotifyAccessTokenTimer;
            const referrer = req.get("Referrer");
            if (referrer) {
                let referrerpath = urlModule.parse(referrer, true);
                referrerpath = referrerpath.path;
                res.redirect(referrerpath);
                // TODO: Fix referrerpath
                //if (referrerpath === "/") {
                //    res.redirect("/spotify");
                // }
            } else {
                res.redirect("/spotify");
            }
        },
        function (err) {
            console.error("Authentication Error", err);
        }
    );
});

// Track Spotify Access Token Expiry
function spotifyAccessTokenRenewal() {
    tokenExpiration = tokenExpiration - 1;
    // Expiration looming, refresh token
    if (tokenExpiration > 0 && tokenExpiration < 60) {
        spotifyApi.refreshAccessToken().then(
            function (data) {
                tokenExpiration = data.body["expires_in"];
                tokenExpiration = parseInt(tokenExpiration);
            },
            function (err) {
                console.error("Could not refresh the token!", err.message);
            }
        );
    }
}

const runSpotifyAccessTokenTimer = setInterval(spotifyAccessTokenRenewal, 1000);

// Search Route
spotifyRouter.post("/search", isAuthenticated, function (req, res) {
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
    spotifyApi.getAlbum(req.params.id).then(function (data) {
        let artwork = data.body.images[0].url;
        if (artwork === null) {
            artwork =
                "https://raw.githubusercontent.com/louisefindlay23/colorflow-player/test/public/img/fallback-imgs/fallback-album.jpg";
        }
        const albumInfo = data.body;
        const path = "./public/img/analysed-artwork/album/" + req.params.id + ".png";

        // Check if already downloaded album image. If not, download it.
        fs.access(path, fs.F_OK, (err) => {
            if (err) {
                console.error(err);
                console.info("Image does not exist -> Downloading");
                // Download album image to get colour
                download(artwork, path, () => {
                    console.info("Artwork Downloaded ✅");
                    res.redirect("/spotify" + req.url);
                });
            } else {
                console.info("Image does exist -> Get Color");
                // Get color and then render album page
                const retrieveColor = async () => {
                    const color = await getColorFromURL(path);
                    res.render("pages/spotify/album", {
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

spotifyRouter.get("/artist/:id", isAuthenticated, function (req, res) {
    const obtainArtistInfo = spotifyApi.getArtist(req.params.id).then((data) => {
        return data.body;
    });
    const obtainArtistAlbumInfo = spotifyApi.getArtistAlbums(req.params.id).then((data) => {
        return data.body.items;
    });

    const retrieveArtwork = async () => {
        let artwork = await obtainArtistInfo;
        if (artwork.images[1]) {
            artwork = artwork.images[1].url;
        } else {
            artwork =
                "https://raw.githubusercontent.com/louisefindlay23/colorflow-player/test/public/img/fallback-imgs/fallback-artist.png";
        }
        const path = "./public/img/analysed-artwork/artist/" + req.params.id + ".png";
        // Check if already downloaded artist image. If not, download it.
        fs.access(path, fs.F_OK, (err) => {
            if (err) {
                console.error(err);
                console.info("Image does not exist -> Downloading");
                // Download artist image to get colour
                download(artwork, path, () => {
                    console.info("Artwork Downloaded ✅");
                    res.redirect("/spotify" + req.url);
                });
            } else {
                console.info("Image does exist -> Get Color");
                // Get info and then render artist page
                const retrieveInfo = async () => {
                    const artistInfo = await obtainArtistInfo;
                    const albumInfo = await obtainArtistAlbumInfo;
                    const color = await getColorFromURL(path);
                    res.render("pages/spotify/artist", {
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

spotifyRouter.get("/playlist/:id", isAuthenticated, function (req, res) {
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

    const retrieveArtwork = async () => {
        let artwork = await obtainPlaylistInfo;
        if (artwork.images[1]) {
            artwork = artwork.images[1].url;
        } else {
            artwork =
                "https://raw.githubusercontent.com/louisefindlay23/colorflow-player/test/public/img/fallback-imgs/fallback-album.jpg";
        }
        const path = "./public/img/analysed-artwork/playlist/" + req.params.id + ".png";
        // Check if already downloaded playlist image. If not, download it.
        fs.access(path, fs.F_OK, (err) => {
            if (err) {
                console.error(err);
                console.info("Image does not exist -> Downloading");
                // Download playlist image to get colour
                download(artwork, path, () => {
                    console.info("Artwork Downloaded ✅");
                    res.redirect("/spotify" + req.url);
                });
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

module.exports = spotifyRouter;