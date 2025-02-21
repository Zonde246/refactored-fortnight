<head>
    <link rel="stylesheet" href="/styles/navbar.css">
    <link rel="stylesheet" href="/styles/typography.css">
    <script src="/scripts/navbar/navbar.js" defer></script>
</head>

<nav class="navbar">
    <div class="left">
        <div class="logo">
            <img src="/public/logo.png" width="106px" height="60px" />
        </div>
        <div class="desktop"><button class="linkButtons">Home</button></div>
        <div class="desktop"><button class="linkButtons">About us</button></div>
        <div class="desktop"><button class="linkButtons">Contact us</button></div>
    </div>
    <div class="right">
        <div id="login" class="desktop"><button class="linkButtons">Login</button></div>
        <div id="user" class="desktop"><button class="linkButtons">Hello Zon!</button></div>
        <div class="mobile">
            <button class="linkButtons" onclick="menuHandler()">Menu</button>
        </div>
    </div>

</nav>

<div id="menu" class="closed">
    <button class="linkButtons">Home</button>
    <button class="linkButtons">About us</button>
    <button class="linkButtons">Contact us</button>
    <button class="linkButtons">Login</button>
    <button class="linkButtons">Hello Zon!</button>
    <button class="linkButtons" onclick="menuHandler()">Close</button>
</div>