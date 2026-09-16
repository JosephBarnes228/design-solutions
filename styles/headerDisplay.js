document.addEventListener('DOMContentLoaded', () => {
    // Mobile navigation hamburger toggle listener
    const navToggle = document.querySelector('.hamburger');
    const bars = document.querySelectorAll('.bars div');
    const links = document.getElementById("links");

    if (navToggle) {
        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            bars.forEach(bar => bar.classList.toggle('x'));
            if (links) {
                links.classList.toggle('responsive');
            }
        });
    }
});