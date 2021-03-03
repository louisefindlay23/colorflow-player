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
    console.log("You searched for " + searchQuery);

    const obtainTrackResults = spotifyApi.searchTracks(searchQuery)
        .then((data) => {
            return data.body.tracks.items;
        });
    const obtainArtistResults = spotifyApi.searchArtists(searchQuery)
        .then((data) => {
            return data.body.artists.items;
        });
    const obtainPlaylistResults = spotifyApi.searchPlaylists(searchQuery)
        .then((data) => {
            return data.body.playlists.items;
        });


    const retrieveResults = async () => {
        const trackResults = await obtainTrackResults;
        const artistResults = await obtainArtistResults;
        const playlistResults = await obtainPlaylistResults;

        console.log(trackResults);

        res.render('pages/spotify/search-results', {
            searchQuery: searchQuery,
            trackResults: trackResults,
            artistResults: artistResults,
            playlistResults: playlistResults
        });
    }
    retrieveResults();
});

spotifyRouter.get("/album", function (req, res) {
    spotifyApi.getAlbum(req.query.id)
        .then(function (data) {
            const artwork = data.body.images[0].url;
            const albumname = data.body.name;
            const tracks = data.body.tracks.items;

            // TODO: Use album name to save/cache analysed artwork
            const path = "./public/img/analysed-artwork/image.png";

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
