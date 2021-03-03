// Play/Pause Audio and Change Icon accordingly
function togglePlay(id) {
    var playButton = document.getElementById(id);
    var audio = document.getElementById("audio" + id);
    if (audio.paused) {
        audio.play();
        playButton.classList.toggle("la-play-circle");
        playButton.classList.toggle("la-pause-circle");
    } else {
        audio.pause();
        playButton.classList.toggle("la-play-circle");
        playButton.classList.toggle("la-pause-circle");
    }
}

// Calculate whether album color is light or dark to change text
function lightOrDark(color) {
    color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
    r = color[1];
    g = color[2];
    b = color[3];
    hsp = Math.sqrt(
        0.299 * (r * r) +
        0.587 * (g * g) +
        0.114 * (b * b)
    );
    if (hsp > 127.5) {

        return 'light';
    } else {

        return 'dark';
    }
}

//if (document.getElementsByTagName("main")[0].style.backgroundColor === "#000") {
//    document.getElementsByTagName("main h2")[0].style.backgroundColor[0].style.color = "#fff";
//}
