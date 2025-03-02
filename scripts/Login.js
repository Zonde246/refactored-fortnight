    document.addEventListener('DOMContentLoaded', () => {
    const card = document.getElementById('portal-card');
    const toSignup = document.getElementById('toggle-to-signup');
    const toLogin = document.getElementById('toggle-to-login');

    // Function to handle animation based on screen width
    const handleFlip = () => {
    // Add/remove flip class to trigger the appropriate animation
    card.classList.toggle('flip');
};

    toSignup.addEventListener('click', handleFlip);
    toLogin.addEventListener('click', handleFlip);
});
