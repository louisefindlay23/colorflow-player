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
