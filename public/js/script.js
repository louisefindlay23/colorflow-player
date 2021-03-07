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

// Calculate whether artwork color is light or dark
function lightOrDark(color) {
    color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
    r = color[1];
    g = color[2];
    b = color[3];
    hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
    if (hsp > 127.5) {
        return "light";
    } else {
        return "dark";
    }
}

document.addEventListener("DOMContentLoaded", function () {
    if (
        window.location.pathname.includes("album") ||
        window.location.pathname.includes("artist") ||
        window.location.pathname.includes("playlist")
    ) {
        adaptiveBackground();
    }
});

// Change text according to background color
function adaptiveBackground() {
    const artworkColor = document.querySelector("main").style.backgroundColor;

    if (lightOrDark(artworkColor) === "light") {
        const adaptiveElements = document.querySelectorAll(
            "h2, h4, p, a, .la-arrow-circle-left, .la-play-circle, .la-pause-circle"
        );
        adaptiveElements.forEach((element) => {
            element.style.color = "#000";
        });
    }
}