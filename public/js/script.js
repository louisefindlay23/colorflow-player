window.addEventListener('load', bookLinks, false);

// Append slash with book id, only if a book ID is not found in the link yet
function bookLinks() {
    const booklinks = document.querySelectorAll('a[href*="/book"]');
    booklinks.forEach(function (el) {
        if (!el.href.includes('id=')) {
            el.href = el.href.replace(/\?.*$/, '') + '?id=' + el.getAttribute('id');
        }
    });
}

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
