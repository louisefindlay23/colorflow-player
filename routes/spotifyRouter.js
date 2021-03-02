const express = require("express");

// Spotify API
const SpotifyWebApi = require('spotify-web-api-node');
var credentials = {
    redirectUri: process.env.REDIRECT_URI,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
};

const spotifyApi = new SpotifyWebApi(credentials);

// Colour Modules
const ColorThief = require('color-thief');
const colorThief = new ColorThief();

const fs = require('fs');
const request = require('request');

// Parse Form Data
const bodyParser = require('body-parser');

// Download Files
const download = (url, path, callback) => {
    request.head(url, (err, res, body) => {
        request(url)
            .pipe(fs.createWriteStream(path))
            .on('close', callback);
    });
};

// Initialise Spotify Router
const spotifyRouter = express.Router();
spotifyRouter.use(bodyParser.urlencoded({
    extended: true
}));
spotifyRouter.use(bodyParser.json());

// Spotify Routes
spotifyRouter.get("/", function (req, res) {
    res.render("pages/spotify/index");
});

spotifyRouter.get('/login', function (req, res) {
    res.redirect("https://accounts.spotify.com/authorize?client_id=" + process.env.CLIENT_ID + "&response_type=code&redirect_uri=" + process.env.REDIRECT_URI + "&scope=user-read-private%20user-read-email&state=some-state-of-my-choice");
});

spotifyRouter.get('/callback', function (req, res) {
    const code = req.query.code;
    spotifyApi.authorizationCodeGrant(code).then(
        function (data) {
            // Set the access token on the API object to use it in later calls
            spotifyApi.setAccessToken(data.body['access_token']);
            spotifyApi.setRefreshToken(data.body['refresh_token']);
            res.redirect("/spotify");
        },
        function (err) {
            console.log('Something went wrong!', err);
        }
    );
});

// Search Route
spotifyRouter.post('/search', function (req, res) {
    const searchType = req.body.searchtype;
    const searchQuery = req.body.searchbar;
    console.log("You searched for an " + searchType + " that's called " + searchQuery);

    if (searchType === "track") {
        spotifyApi.searchTracks(searchQuery)
            .then(function (data) {
                const trackResult = data.body.tracks.items;
                res.render('pages/spotify/search-results', {
                    results: trackResult,
                });
            }, function (err) {
                console.error(err);
            });
    } else if (searchType === "artist") {
        spotifyApi.searchArtists(searchQuery)
            .then(function (data) {
                console.log("Search artists for ", data.body.artists.items);
                res.redirect("/");
            }, function (err) {
                console.error(err);
            });
    } else if (searchType === "playlist") {
        spotifyApi.searchPlaylists(searchQuery)
            .then(function (data) {
                console.log("Search playlist for ", data.body.playlists.items);
                res.redirect("/");
            }, function (err) {
                console.error(err);
            });
    }

});

spotifyRouter.get("/album", function (req, res) {
    spotifyApi.getAlbum('6zeHM5CV0CjcS0K8ouWE4N')
        .then(function (data) {
            const artwork = data.body.images[0].url;
            const albumname = data.body.name;
            const tracks = data.body.tracks.items;
            console.log(tracks);

            const path = './public/img/image.png';

            download(artwork, path, () => {
                let color = colorThief.getColor(path);

                res.render('pages/spotify/album', {
                    artwork: artwork,
                    albumname: albumname,
                    color: color,
                    tracks: tracks
                });
            });
        }, function (err) {
            console.error(err);
        });
});

module.exports = spotifyRouter;
