# ColorFlow Player

Colorflow Player is a Node.js music streaming app (Spotify and Apple Music) where the color of the album view and now playing screen changes to match the predominate color of the album artwork which is called ColorFlow.

## Features

-   Search for tracks, albums, artists or playlists
-   Spotify and Deezer Streaming (30s previews)
-   Beautiful Colorflow-inspired album, artist and playlist views
-   Spotify and Deezer-inspired user interface
-   Analytics Dashboard (page views and song plays) - requires account

## Planned Updates

See the open [Issues](https://github.com/louisefindlay23/colorflow-player/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc) for planned updates for v2 of the web app.

## Inspiration

### Colorflow Players

Colorflow was first introduced in iTunes and the iOS Music app but was removed in iTunes 12.5 and iOS 10. Since then a number of jailbreak tweaks (the most popular being [ColorFlow](https://www.idownloadblog.com/2020/02/19/colorflow-5)) have been released and a few third-party iOS Music apps such as [Doppler](https://www.macobserver.com/news/doppler-music-player-ios) and [Power Player](https://powerplayer.evenwerk.com) have supported the feature.

![Doppler Album View](https://apphuntt.files.wordpress.com/2018/08/7a61053f-0b26-4749-8eeb-d46fe75a65ef.png?w=450)
![ColorFlow Now Playing](https://i.imgur.com/VMXdzFW.png)

### Colour Matching

Chris Banes created an [Android utility](https://chris.banes.dev/colour-matching) using Java to take the three dominant colours (primary, secondary and tertiary) from an image and create two colours (primary text and secondary text) that provide enough contrast from the background so text is readable. His approach uses [ColorThief](https://lokeshdhakar.com/projects/color-thief) as a basis and then uses a custom approach to fine tune the results.

## Technologies Used

-   [Node.js](https://nodejs.org/en) - `server.js` is the main server file for the web app which runs the server and sets up live reloading for server and client code (if `process.env.NODE_ENV` is development). It also includes Express, Express Session and sets Mongo as Session Storage as well as includes the routes stored in the `routes` directory and 404 route.
-   CSS - CSS files are stored in `public/css`. Split into `main.css`, `responsive.css`, `spotify.css` and `deezer.css` so the main styles are in `main.css` with some mobile responsive tweaks in `responsive.css`. The Spotify and Deezer routes have their own CSS for their branded UI which contains the necessary media queries at the bottom of the file. Comments have been used to divide each file into sections.
-   Fonts - Fonts used are Lato, Raleway, Squealer, Open Sans and DM Sans. Squealer is a custom webfont font file stored in `public/css/fonts` and the rest are Google Fonts.
-   Vanilla JS - Client-side JS is stored in `public/js/script.js`. The main JS function handles audio playback since the play icon is a Font Awesome icon and dynamically changes the text color so it's readable if the dynamic background color is light or dark. It also communicates with the server's `/analytics` route to trigger analytics updates.
-   [DigitalOcean](https://www.digitalocean.com/) - The web app is hosted on a DigitalOcean droplet under a NGINX server and managed by the Node process manager, [PM2](https://pm2.keymetrics.io). The site is SSL encrypted by Certbot and uses a custom subdomain.

### Dependencies

-   [Express](https://expressjs.com) - Node.js Web Server
-   [Express Session](https://github.com/expressjs/session) - Creates session to track analytics and save user logins
-   [connect-mongo](https://www.npmjs.com/package/connect-mongo) - Use MongoDB Database as permanent session storage so analytics can be retrieved from all sessions
-   [EJS](https://ejs.co) - Templating Language

-   [PassportJS](http://www.passportjs.org) - Passport allows to easily authenticate users via a variety of strategies
-   [Passport-Local](https://github.com/jaredhanson/passport-local) - Passport Local Strategy to authenticate users via username and password to view analytics
-   [bcrypt](https://www.npmjs.com/package/bcrypt) - Salts and hashes user passwords before they are stored in the database

-   [Spotify Web API Node](https://github.com/thelinmichael/spotify-web-api-node) - Node.js Spotify API Wrapper
-   [Deezer Public API](https://github.com/zaosoula/deezer-public-api) - Node.js Deezer Public API Wrapper (Parts of the Deezer API where users don't need to log in)
-   [Color Thief Node](https://lokeshdhakar.com/projects/color-thief) - Analyses colours from album artwork, playlist artwork and artist images to generate background color

-   [dotenv](https://www.npmjs.com/package/dotenv) - Securely store environment variables such as API keys and DB details
-   [fs] - Used to download artwork images to the server filesystem so Color Thief can analyse them. The downloaded artwork/images are then used on the album/artist/playlist pages to avoid waiting for them remotely. Stored in `public/img/analysed-artwork`. Images are separated by streaming service and then by type. Fallbacks are provided in `public/img/fallback-imgs` if there is no image available.
-   [MongoDB](https://www.npmjs.com/package/mongodb) - Node.js driver to interact with MongoDB Database. The database is used as a permanent session store and for users (usernames and hashed passwords.)
-   [node-fetch](https://www.npmjs.com/package/node-fetch) - Node.js version of Fetch to download artwork from remote URLs

## Dev Dependencies

`npm start` runs the web app and `npm run server` starts the live-reload development server using the below NPM modules.

-   [Nodemon](https://www.npmjs.com/package/nodemon) - Live reloads Node server when server-side code changes
-   [node-livereload](https://www.npmjs.com/package/livereload) - Live reload for client-side code
