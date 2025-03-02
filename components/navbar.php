<?php function NavigationBar()
{
    return '
        <head>
    <link rel="stylesheet" href="/styles/navbar.css">
    
    <script src="/scripts/navbar/navbar.js" defer></script>
</head>

<header>
    <nav class="top-nav">
        <a href="#" class="logo">Shanti<span>Ashram</span></a>
        
        <!-- Hamburger Menu Button -->
        <div class="hamburger-menu" id="hamburger-toggle">
            <span></span>
            <span></span>
            <span></span>
        </div>
        
        <ul class="nav-links" id="nav-menu">
            <li><a href="./">Home</a></li>
            <li><a href="./about.php">About</a></li>
            <li><a href="#">Programs</a></li>
            <li><a href="./contact.php">Contact us</a></li>
            <li><a href="./login.php">Login</a></li>
        </ul>
    </nav>
</header>';
}
?>
