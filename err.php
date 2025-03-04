<?php
echo '
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 - Spiritual Journey Detour | Ashram</title>
  <style>
   :root {
      --dark-purple: #07020d;
      --light-purple: #f6f1fd;
      --vibrant-purple: #732ddb;
      --soft-pink: #eb8dc4;
      --coral: #e15270;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      margin: 0;
      padding: 0;
      font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
      background-color: var(--dark-purple);
      color: var(--light-purple);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow-x: hidden;
      position: relative;
    }
    
    .stars {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    }
    
    .star {
      position: absolute;
      background-color: var(--light-purple);
      border-radius: 50%;
      opacity: 0;
      animation: twinkle 5s infinite;
    }
    
    @keyframes twinkle {
      0% { opacity: 0; }
      50% { opacity: 1; }
      100% { opacity: 0; }
    }
    
    .container {
      text-align: center;
      width: 90%;
      max-width: 800px;
      padding: 2rem 1rem;
      position: relative;
      z-index: 10;
      margin: 0 auto;
    }
    
    .flower {
      width: 180px;
      height: 180px;
      margin: 0 auto 20px;
      position: relative;
    }
    
    .petal {
      position: absolute;
      width: 70px;
      height: 70px;
      background-color: var(--soft-pink);
      border-radius: 70% 0 70% 0;
      transform-origin: bottom right;
      opacity: 0.9;
      animation: float 6s infinite ease-in-out;
    }
    
    .petal:nth-child(1) { transform: rotate(0deg) translate(-35px, -35px); animation-delay: 0s; }
    .petal:nth-child(2) { transform: rotate(45deg) translate(-35px, -35px); animation-delay: 0.5s; }
    .petal:nth-child(3) { transform: rotate(90deg) translate(-35px, -35px); animation-delay: 1s; }
    .petal:nth-child(4) { transform: rotate(135deg) translate(-35px, -35px); animation-delay: 1.5s; }
    .petal:nth-child(5) { transform: rotate(180deg) translate(-35px, -35px); animation-delay: 2s; }
    .petal:nth-child(6) { transform: rotate(225deg) translate(-35px, -35px); animation-delay: 2.5s; }
    .petal:nth-child(7) { transform: rotate(270deg) translate(-35px, -35px); animation-delay: 3s; }
    .petal:nth-child(8) { transform: rotate(315deg) translate(-35px, -35px); animation-delay: 3.5s; }
    
    .center {
      position: absolute;
      width: 50px;
      height: 50px;
      background-color: var(--coral);
      border-radius: 50%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 2;
      box-shadow: 0 0 15px var(--vibrant-purple);
    }
    
    .om {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 30px;
      color: var(--light-purple);
      z-index: 3;
    }
    
    @keyframes float {
      0%, 100% { transform-origin: bottom right; transform: rotate(calc(45deg * var(--i))) translate(-35px, -35px) scale(1); }
      50% { transform-origin: bottom right; transform: rotate(calc(45deg * var(--i))) translate(-35px, -35px) scale(1.1); }
    }
    
    h1 {
      font-size: clamp(3rem, 15vw, 4rem);
      margin: 0;
      color: var(--vibrant-purple);
      text-shadow: 0 0 10px rgba(115, 45, 219, 0.5);
    }
    
    h2 {
      font-size: clamp(1.2rem, 5vw, 2rem);
      margin: 0.5rem 0 1.5rem;
      color: var(--coral);
    }
    
    p {
      font-size: clamp(1rem, 4vw, 1.2rem);
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }
    
    .button-container {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 15px;
    }
    
    .btn {
      display: inline-block;
      padding: clamp(10px, 3vw, 12px) clamp(16px, 5vw, 24px);
      background-color: var(--vibrant-purple);
      color: var(--light-purple);
      text-decoration: none;
      border-radius: 30px;
      font-weight: bold;
      letter-spacing: 1px;
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
      font-size: clamp(0.9rem, 3vw, 1rem);
      white-space: nowrap;
    }
    
    .btn:hover {
      background-color: var(--coral);
      transform: translateY(-3px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
    }
    
    .quote {
      font-style: italic;
      max-width: 600px;
      margin: 2rem auto;
      padding: 1rem;
      border-top: 1px solid var(--soft-pink);
      border-bottom: 1px solid var(--soft-pink);
      font-size: clamp(0.9rem, 3vw, 1.1rem);
    }
    
    @media (max-width: 768px) {
      .flower {
        width: clamp(120px, 40vw, 180px);
        height: clamp(120px, 40vw, 180px);
      }
      
      .petal {
        width: clamp(50px, 16vw, 70px);
        height: clamp(50px, 16vw, 70px);
      }
      
      .center {
        width: clamp(35px, 12vw, 50px);
        height: clamp(35px, 12vw, 50px);
      }
      
      .om {
        font-size: clamp(20px, 8vw, 30px);
      }
      
      .container {
        padding: 1.5rem 1rem;
      }
    }
    
    @media (max-width: 480px) {
      .button-container {
        flex-direction: column;
        width: 100%;
        max-width: 250px;
        margin: 0 auto;
      }
      
      .btn {
        width: 100%;
      }
    }
    
  </style>
</head>
<body>
  <div class="stars" id="stars"></div>
  
  <div class="container">
    <div class="flower">
      <div class="petal" style="--i: 0;"></div>
      <div class="petal" style="--i: 1;"></div>
      <div class="petal" style="--i: 2;"></div>
      <div class="petal" style="--i: 3;"></div>
      <div class="petal" style="--i: 4;"></div>
      <div class="petal" style="--i: 5;"></div>
      <div class="petal" style="--i: 6;"></div>
      <div class="petal" style="--i: 7;"></div>
      <div class="center">
        <div class="om">ॐ</div>
      </div>
    </div>
    
    <h1>404</h1>
    <h2>Your path has momentarily diverged</h2>
    
    <p>The page you seek has transcended to another plane or perhaps was never manifested in this reality.</p>
    
    <div class="quote">
      "Sometimes the most enlightening journeys begin with a wrong turn."
    </div>
    
    <div class="button-container">
      <a href="../" class="btn">Return to Center</a>
    <a href="../" class="btn">Begin Meditation</a>
    </div>
  </div>
  
  <script>
    const starsContainer = document.getElementById("stars");
    const numStars = 100;
    
    for (let i = 0; i < numStars; i++) {
        const star = document.createElement("div");
        star.classList.add("star");

        const size = Math.random() * 3;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;

        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;

        star.style.animationDelay = `${Math.random() * 5}s`;

        starsContainer.appendChild(star);
    }
  </script>
</body>
</html>
    ';