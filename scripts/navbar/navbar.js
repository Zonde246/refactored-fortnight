//  Load local storage and check for session

// Load local storage


const hamburgerToggle = document.getElementById('hamburger-toggle');
const navMenu = document.getElementById('nav-menu');
if (hamburgerToggle && navMenu) {
    hamburgerToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        // Optional: Add animation to hamburger icon
        const spans = this.querySelectorAll('span');
        spans.forEach(span => span.classList.toggle('active'));
    });
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!navMenu.contains(event.target) && !hamburgerToggle.contains(event.target)) {
            navMenu.classList.remove('active');
            // Reset hamburger icon
            const spans = hamburgerToggle.querySelectorAll('span');
            spans.forEach(span => span.classList.remove('active'));
        }
    });
}
