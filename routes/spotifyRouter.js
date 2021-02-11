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
const onecolor = require('onecolor');

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

// Spotify Router
const spotifyRouter = express.Router();

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
            res.redirect("/spotify/album");
        },
        function (err) {
            console.log('Something went wrong!', err);
        }
    );
});

spotifyRouter.get("/album", function (req, res) {
    spotifyApi.getAlbum('6zeHM5CV0CjcS0K8ouWE4N')
        .then(function (data) {
            let artworkurl = data.body.images[0].url;
            const albumname = data.body.name;
            const trackinfo = data.body.tracks.items;
            console.log(trackinfo);

            const path = './public/img/image.png';

            download(artworkurl, path, () => {
                const rgb = colorThief.getColor(path);
                const rgbCode = 'rgb( ' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
                const hex = onecolor(rgbCode).hex();

                res.render('pages/spotify/album', {
                    artworkurl: artworkurl,
                    albumname: albumname,
                    hex: hex,
                    trackinfo: trackinfo
                });
            });
        }, function (err) {
            console.error(err);
        });
});

// Search Route - TBD
spotifyRouter.post('/search', function (req, res) {
    const bookquery = req.body.book;
    const booklist = gr.searchBooks({
        q: bookquery,
        page: 1,
        field: 'title'
    });
    booklist.then(function (result) {
        const bookresult = result.search.results.work;
        console.log(bookresult);
        res.render('pages/search-results', {
            bookresult: bookresult
        });
    }).catch(function () {
        console.log("Goodreads Search Books Rejected");
    });
});

module.exports = spotifyRouter;
