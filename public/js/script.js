// Move Analytics button to the right if only button
const headerButtons = document.querySelectorAll("header button");
if (headerButtons.length === 1) {
    headerButtons[0].style.left = "auto";
}

// Center grid card if only one
document.querySelectorAll(".grid-row").forEach((grid) => {
    if (grid.children.length === 1) {
        grid.classList.remove("grid-row");
        grid.classList.add("flex-row");
    }
});

// Move header buttons to the bottom for mobile nav
document.addEventListener("DOMContentLoaded", function () {
    const headerStyles = window.getComputedStyle(document.querySelector("header .flex-row-center"));
    if (headerStyles.getPropertyValue("display") === "block") {
        const headerButtons = document.querySelectorAll("header button");
        headerButtons.forEach((button) => {
            const newButton = button.cloneNode();
            newButton.innerHTML = button.innerHTML;
            document.querySelector("header").appendChild(newButton);
            button.remove();
        });
    }
});

// Play/Pause Audio and Change Icon accordingly
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("#songs i").forEach((playButton) => {
        playButton.addEventListener("click", (e) => {
            const audio = e.target.nextElementSibling;
            if (audio.paused) {
                document.querySelectorAll("#songs audio").forEach((track) => {
                    if (!track.paused) {
                        track.pause();
                        track.previousElementSibling.classList.remove("la-pause-circle");
                        track.previousElementSibling.classList.add("la-play-circle");
                    }
                });
                audio.play();
                songCounter();
            } else {
                audio.pause();
            }
            e.target.classList.toggle("la-play-circle");
            e.target.classList.toggle("la-pause-circle");
        });
    });
});

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
                "main h2, main h3, main a, #artist-stats p, #album p, #playlist p, #songs h4, #songs p, #playlist-songs p, #playlist-songs h4, .la-arrow-circle-left, .la-play-circle, .la-pause-circle"
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

// Send page views to server (to avoid counting redirects)
document.addEventListener("DOMContentLoaded", pageCounter());
function pageCounter() {
    fetch(window.location.origin + "/analytics", {
        method: "POST",
        mode: "same-origin",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ pageView: true }),
    }).catch((err) => {
        console.error(err);
    });
}

// Send song plays to server
function songCounter() {
    fetch(window.location.origin + "/analytics", {
        method: "POST",
        mode: "same-origin",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ songPlay: true }),
    }).catch((err) => {
        console.error(err);
    });
}

// Reset analytics
function resetAnalytics() {
    fetch(window.location.origin + "/analytics", {
        method: "DELETE",
        mode: "same-origin",
    }).catch((err) => {
        console.error(err);
    });
}
