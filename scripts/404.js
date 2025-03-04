const starsContainer = document.getElementById("stars");
const numStars = 100;

for (let i = 0; i < numStars; i++) {
    const star = document.createElement("div");
    star.classList.add("star");

    // Random size
    const size = Math.random() * 3;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;

    // Random position
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;

    // Random animation delay
    star.style.animationDelay = `${Math.random() * 5}s`;

    starsContainer.appendChild(star);
}