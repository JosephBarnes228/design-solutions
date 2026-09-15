document.addEventListener('DOMContentLoaded', () => {
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

    // Highlight active link accurately based on current URL path
    let currentPath = window.location.pathname.toLowerCase();
    
    // Normalize path trailing slashes
    if (!currentPath.endsWith('/') && !currentPath.endsWith('.html')) {
        currentPath += '/';
    }

    const navLinks = document.querySelectorAll('.links li a');
    
    // Remove all existing active classes first
    navLinks.forEach(link => link.classList.remove('active'));

    const isHome = currentPath === '/' || currentPath === '/index.html';

    navLinks.forEach(link => {
        const href = (link.getAttribute('href') || '').toLowerCase();
        if (!href) return;

        if (isHome) {
            if (href === '/' || href === '/index.html') {
                link.classList.add('active');
            }
        } else {
            // Non-home pages: match directory path (e.g. /services/, /shops/, /articles/, /about/, /contact/)
            const cleanHref = href.replace('index.html', '');
            if (cleanHref !== '/' && cleanHref !== '/index.html' && currentPath.includes(cleanHref)) {
                link.classList.add('active');
            }
        }
    });
});