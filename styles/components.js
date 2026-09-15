(function() {
    var path = window.location.pathname.replace(/\\/g, '/');
    var parts = path.split('/').filter(function(p) { return p.length > 0; });
    
    if (parts.length > 0 && parts[0].toLowerCase() === 'design-solutions') {
        parts.shift();
    }
    if (parts.length > 0 && parts[parts.length - 1].indexOf('.html') !== -1) {
        parts.pop();
    }
    
    var depth = parts.length;
    var r = depth === 0 ? './' : '../'.repeat(depth);

    var homeLink = r + 'index.html';
    var servicesLink = r + 'services/';
    var shopsLink = r + 'shops/';
    var articlesLink = r + 'articles/';
    var aboutLink = r + 'about/';
    var contactLink = r + 'contact/';
    var logoImg = r + 'img/logo.png';
    var linkedinImg = r + 'img/linkedin.png';
    var googleImg = r + 'img/google.png';

    // Universal Header Component Markup (No duplicate Contact in ul#links)
    var headerHTML = `
        <nav id="navbar">
            <div id="header-logo">
                <a href="${homeLink}"><img id="logo" src="${logoImg}" alt="Design Solutions Logo"></a>
            </div>
            <ul id="links" class="links">
                <li><a href="${homeLink}">Home</a></li>
                <li><a href="${servicesLink}">Services</a></li>
                <li><a href="${shopsLink}">3D Shop Configurator</a></li>
                <li><a href="${articlesLink}">Articles</a></li>
                <li><a href="${aboutLink}">About</a></li>
            </ul>
            <div class="nav-actions">
                <a class="social-icon-btn mobile-invis" href="https://www.linkedin.com/in/rob-barnes-83904142" target="_blank" title="LinkedIn">
                    <img src="${linkedinImg}" alt="LinkedIn">
                </a>
                <a class="social-icon-btn mobile-invis" href="https://www.google.com/search?q=design+solutions+ridgefield+washington#lrd=0x5495ad154a55151f:0xeeca93b6a80696ab,1,,," target="_blank" title="Google Reviews">
                    <img src="${googleImg}" alt="Google Reviews">
                </a>
                <a href="${contactLink}" class="btn-primary" id="header-contact">Contact Us</a>
                <div class="hamburger" id="hamburger-btn">
                    <div class="bars">
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                </div>
            </div>
        </nav>
    `;

    // Universal Multi-Column Footer Component Markup
    var footerHTML = `
        <div class="footer-container">
            <div class="footer-brand">
                <h3>DESIGN SOLUTIONS</h3>
                <p>Vancouver & Pacific NW residential design firm specializing in energy-efficient custom home plans, remodels, additions, ADUs, and custom shops.</p>
            </div>
            <div class="footer-section">
                <h4>Explore</h4>
                <a href="${homeLink}">Home</a>
                <a href="${shopsLink}">3D Shop Configurator</a>
                <a href="${servicesLink}">Services</a>
                <a href="${contactLink}">Contact</a>
                <a href="${articlesLink}">Articles</a>
                <a href="${aboutLink}">About</a>
            </div>
            <div class="footer-section">
                <h4>Contact Us</h4>
                <a href="mailto:designguyrob@gmail.com">designguyrob@gmail.com</a>
                <a href="tel:3606935161">360.693.5161</a>
                <p style="color: var(--text-muted); margin-top: 0.5rem; font-size: 0.9rem;">Ridgefield, Washington</p>
            </div>
            <div class="footer-section">
                <h4>Connect</h4>
                <a target="_blank" href="https://www.google.com/search?q=design+solutions+ridgefield+washington#lrd=0x5495ad154a55151f:0xeeca93b6a80696ab,1,,,">Google Reviews</a>
                <a target="_blank" href="https://www.linkedin.com/in/rob-barnes-83904142">LinkedIn</a>
            </div>
        </div>
        <div id="footer-copyright">&copy; Copyright Design Solutions - 2012-2026. All rights reserved.</div>
    `;

    function renderComponents() {
        var headerElem = document.getElementById('header');
        if (headerElem) {
            headerElem.innerHTML = headerHTML;
        }

        var footerElem = document.getElementById('footer');
        if (footerElem) {
            footerElem.innerHTML = footerHTML;
        }

        // Highlight Active Page Link in Navbar
        var p = window.location.pathname.toLowerCase().replace(/\\/g, '/');
        var navLinks = document.querySelectorAll('#links li a');
        var contactBtn = document.getElementById('header-contact');
        
        var isServices = (p.indexOf('/services') !== -1);
        var isShops = (p.indexOf('/shops') !== -1);
        var isArticles = (p.indexOf('/articles') !== -1);
        var isAbout = (p.indexOf('/about') !== -1);
        var isContact = (p.indexOf('/contact') !== -1);
        var isHome = (!isServices && !isShops && !isArticles && !isAbout && !isContact);

        navLinks.forEach(function(link) {
            link.classList.remove('active');
            var text = link.textContent.trim().toLowerCase();
            
            if (isHome && text === 'home') {
                link.classList.add('active');
            } else if (isServices && text === 'services') {
                link.classList.add('active');
            } else if (isShops && text.indexOf('shop') !== -1) {
                link.classList.add('active');
            } else if (isArticles && text === 'articles') {
                link.classList.add('active');
            } else if (isAbout && text === 'about') {
                link.classList.add('active');
            }
        });

        if (contactBtn) {
            if (isContact) {
                contactBtn.classList.add('active');
                contactBtn.style.boxShadow = '0 0 16px rgba(56, 189, 248, 0.6)';
            } else {
                contactBtn.classList.remove('active');
                contactBtn.style.boxShadow = '';
            }
        }

        // Mobile Hamburger toggle
        var hamburgerBtn = document.getElementById('hamburger-btn');
        var linksContainer = document.getElementById('links');
        if (hamburgerBtn && linksContainer) {
            hamburgerBtn.addEventListener('click', function() {
                linksContainer.classList.toggle('responsive');
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderComponents);
    } else {
        renderComponents();
    }
})();
