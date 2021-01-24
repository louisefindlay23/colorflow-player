## ColorFlow Player

Colorflow Player is a Node.js music streaming app (Spotify and Apple Music) where the color of the album view and now playing screen changes to match the predominate color of the album artwork which is called ColorFlow.

## Planned Features
- Spotify and Apple Music Streaming (Choose your preferred streaming service on the homepage)
- Beautiful Colorflow-inspired album and now-playing views
- Branded Spotify and Apple Music UI
- Search for tracks, albums or artists

## Inspiration

### Colorflow Players

Colorflow was first introduced in iTunes and the iOS Music app but was removed in iTunes 12.5 and iOS 10. Since then a number of jailbreak tweaks (the most popular being [ColorFlow](https://www.idownloadblog.com/2020/02/19/colorflow-5)) have been released and a few third-party iOS Music apps such as [Doppler](https://www.macobserver.com/news/doppler-music-player-ios) and [Power Player](https://powerplayer.evenwerk.com) have supported the feature.

### Colour Matching

Chris Banes created an [Android utility](https://chris.banes.dev/colour-matching) using Java to take the three dominant colours (primary, secondary and tertiary) from an image and create two colours (primary text and secondary text) that provide enough contrast from the background so text is readable. His approach uses [ColorThief](https://lokeshdhakar.com/projects/color-thief) as a basis and then uses a custom approach to fine tune the results.

## Technology Used:

### Currently

- [Node.js](https://nodejs.org/en) - Server-side JavaScript
- [Express](https://expressjs.com) - Node.js Web Server
- [EJS](https://ejs.co) - Templating Language
- [Spotify Web API Node](https://github.com/thelinmichael/spotify-web-api-node) - Node.js Spotify API Wrapper
- [Color Thief](https://lokeshdhakar.com/projects/color-thief) - Analyse colours from an image
- [One Color](https://www.npmjs.com/package/onecolor) - Convert RBG colour codes to HEX

### Planned

- [MusicKit JS](https://developer.apple.com/documentation/musickitjs) - Client-side Apple Music API
- [Vue.js](https://vuejs.org) - Front-End JavaScript Framework (to replace EJS)
- [Express AB](https://github.com/omichelsen/express-ab) - AB split testing (to see whether Apple Music or Spotify streaming is the most popular)
