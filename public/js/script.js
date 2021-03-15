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

    if (window.location.pathname.includes("spotify")) {
        // If background is light, change text to black
        if (lightOrDark(artworkColor) === "light") {
            const adaptiveElements = document.querySelectorAll(
                "main h2, main h3, main a, #artist-stats p, #album p, #playlist p, #songs h4, #songs p, .la-arrow-circle-left, .la-play-circle, .la-pause-circle"
            );
            adaptiveElements.forEach((element) => {
                element.style.color = "#000000";
            });
        }
    } else {
        // If background is dark, change text to white
        if (lightOrDark(artworkColor) === "dark") {
            const adaptiveElements = document.querySelectorAll(
                "main h2, main h3, main a, main p, main h4, .la-arrow-circle-left, .la-play-circle, .la-pause-circle, #songs .flex-row"
            );
            adaptiveElements.forEach((element) => {
                element.style.color = "#ffffff";
                element.style.borderColor = "#ffffff";
            });
        }
    }
}

// TODO: Move Analytics button to left and have Log Out button in right. Show on all pages until logged out

// Change Analytics button to Log Out
document.addEventListener("DOMContentLoaded", function () {
    if (window.location.pathname === "/analytics") {
        const button = document.querySelector("header button");
        button.innerText = "Log Out";
        button.value = "Log Out";
        button.onClick = "/logout";
    }
});
