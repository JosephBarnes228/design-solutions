let navToggle = document.querySelector('.bars');
let bars = document.querySelectorAll('.bars div');
function toggleHamburger(e) {
    bars.forEach(bar => bar.classList.toggle('x'));
    var links = document.getElementById("links");
    if (links.className === "links") {
        links.className += " responsive";
    } else {
        links.className = "links";
    }
}

navToggle.addEventListener('click', toggleHamburger);