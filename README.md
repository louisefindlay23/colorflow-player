# ColorFlow Player

Colorflow Player is a Node.js music streaming app (Spotify and Apple Music) where the color of the album view and now playing screen changes to match the predominate color of the album artwork which is called ColorFlow.

## Features

-   Search for tracks, albums, artists or playlists
-   Spotify and Deezer Streaming (30s previews)
-   Beautiful Colorflow-inspired album, artist and playlist views
-   Spotify and Deezer-inspired user interface
-   Analytics Dashboard (page views and song plays) - requires account

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
-   [Express Session]() - Session
-   [EJS](https://ejs.co) - Templating Language
-   [Spotify Web API Node](https://github.com/thelinmichael/spotify-web-api-node) - Node.js Spotify API Wrapper
-   [Deezer Public API]() - Deezer Public API Wrapper (Parts of the Deezer API where users don't need to log in)
-   [Color Thief Node](https://lokeshdhakar.com/projects/color-thief) - Analyse colours from an image to generate background color
-   [bcrypt]() - Salts and hashes user passwords
-   [connect-mongo]() - Use MongoDB Database as permanent session storage
-   [dotenv]() - Securely store environment variables
-   [fs]() - Filesystem module to download images
-   [Mongo] - Node.js driver to interact with MongoDB Database
-   [node-fetch]() - Fetch artwork to be downloaded
-   [Passport]() - Passport
-   [Passport-Local]() - Passport Local

## Dev Dependencies

-   [Nodemon]() - Live reloads Node server when server-side code changes
-   [Livereload]() - Live reload for client-side code
