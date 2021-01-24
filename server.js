// Server Modules
const express = require('express');
const ejs = require('ejs');
const app = express();

require('dotenv').config();

// Spotify API
const SpotifyWebApi = require('spotify-web-api-node');
var credentials = {
    redirectUri: process.env.REDIRECT_URI,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
};

var spotifyApi = new SpotifyWebApi(credentials);

// Colour Modules
const ColorThief = require('color-thief');
const colorThief = new ColorThief();
const onecolor = require('onecolor');

const fs = require('fs');
const request = require('request');

// Initialising Express
app.use(express.static('public'));
// set the view engine to ejs
app.set('view engine', 'ejs');

app.listen(8080);
console.log('Listening on 8080');

const download = (url, path, callback) => {
    request.head(url, (err, res, body) => {
        request(url)
            .pipe(fs.createWriteStream(path))
            .on('close', callback);
    });
};

// *** GET Routes - display pages ***

// Root Route
app.get("/", function (req, res) {
    res.render("pages/index");
});

// Spotify Player

app.get("/spotify", function (req, res) {
    res.render("pages/spotify/index");
});

app.get('/spotify/login', function (req, res) {
    res.redirect("https://accounts.spotify.com/authorize?client_id=" + process.env.CLIENT_ID + "&response_type=code&redirect_uri=" + process.env.REDIRECT_URI + "&scope=user-read-private%20user-read-email&state=some-state-of-my-choice");
});

app.get('/callback', function (req, res) {
    var code = req.query.code;
    spotifyApi.authorizationCodeGrant(code).then(
        function (data) {
            console.log('The token expires in ' + data.body['expires_in']);
            console.log('The access token is ' + data.body['access_token']);
            console.log('The refresh token is ' + data.body['refresh_token']);

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

app.get("/spotify/album", function (req, res) {
    spotifyApi.getAlbum('6zeHM5CV0CjcS0K8ouWE4N')
        .then(function (data) {
            var artworkurl = data.body.images[0].url;
            var albumname = data.body.name;
            var trackinfo = data.body.tracks.items;
            console.log(trackinfo);

            var url = artworkurl;
            var path = './public/img/image.png';

            download(url, path, () => {
                console.log('✅ Done!');
                var rgb = colorThief.getColor(path);
                var rgbCode = 'rgb( ' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
                var hex = onecolor(rgbCode).hex();

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
app.post('/search', function (req, res) {
    var bookquery = req.body.book;
    var booklist = gr.searchBooks({
        q: bookquery,
        page: 1,
        field: 'title'
    });
    booklist.then(function (result) {
        var bookresult = result.search.results.work;
        console.log(bookresult);
        res.render('pages/search-results', {
            bookresult: bookresult
        });
    }).catch(function () {
        console.log("Goodreads Search Books Rejected");
    });
});

// Apple Music Player
