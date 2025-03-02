<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="/styles/navbar.css">
    <link rel="stylesheet" href="/styles/main.css">
    <link rel="stylesheet" href="/styles/auth/signup.css">
    <link rel="stylesheet" href="/styles/auth/mobile.css">
    <link rel="stylesheet" href="/styles/auth/desktop.css">
    <title>Document</title>
    <script src="/scripts/Login.js" defer ></script>
</head>

<body>
<?php include './components/navbar.php';
echo NavigationBar();
?>
    <section class="auth-section">
        <div class="portal-container">
            <div class="portal-card" id="portal-card">
                <!-- Front - Login Form -->
                <div class="card-face front">
                    <div class="illustration">
                        <svg class="mandala" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#732ddb" stroke-width="0.5"/>
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#732ddb" stroke-width="0.5"/>
                            <circle cx="50" cy="50" r="35" fill="none" stroke="#732ddb" stroke-width="0.5"/>
                            <circle cx="50" cy="50" r="30" fill="none" stroke="#732ddb" stroke-width="0.5"/>
                            <circle cx="50" cy="50" r="25" fill="none" stroke="#732ddb" stroke-width="0.5"/>
                            <g>
                                <path fill="none" stroke="#732ddb" stroke-width="0.5" d="M50,5 C70,20 80,40 50,95 C20,40 30,20 50,5Z"/>
                                <path fill="none" stroke="#732ddb" stroke-width="0.5" d="M5,50 C20,70 40,80 95,50 C40,20 20,30 5,50Z"/>
                                <path fill="none" stroke="#732ddb" stroke-width="0.5" d="M95,50 C80,30 60,20 5,50 C60,80 80,70 95,50Z"/>
                                <path fill="none" stroke="#732ddb" stroke-width="0.5" d="M50,95 C30,80 20,60 50,5 C80,60 70,80 50,95Z"/>
                            </g>
                        </svg>
                        <svg class="meditation-figure" viewBox="0 0 100 100">
                            <circle cx="50" cy="35" r="12" fill="#732ddb" opacity="0.8"/>
                            <path fill="#732ddb" opacity="0.8" d="M38,45 C38,65 62,65 62,45 C52,55 48,55 38,45Z"/>
                            <path fill="#732ddb" opacity="0.8" d="M30,70 C30,80 70,80 70,70 C60,90 40,90 30,70Z"/>
                        </svg>
                    </div>
                    <div class="form-section">
                        <h2>Welcome Back</h2>
                        <div class="input-group">
                            <input type="email" id="login-email" required>
                            <label for="login-email">Email</label>
                        </div>
                        <div class="input-group">
                            <input type="password" id="login-password" required>
                            <label for="login-password">Password</label>
                        </div>
                        <button type="button">Sign In</button>
                        <div class="toggle-form">
                            <span>Don't have an account?</span>
                            <button class="toggle-btn" id="toggle-to-signup">Sign Up</button>
                        </div>
                    </div>
                </div>

                <!-- Back - Signup Form -->
                <div class="card-face back">
                    <div class="illustration">
                        <svg class="mandala" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#e15270" stroke-width="0.5"/>
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#e15270" stroke-width="0.5"/>
                            <circle cx="50" cy="50" r="35" fill="none" stroke="#e15270" stroke-width="0.5"/>
                            <circle cx="50" cy="50" r="30" fill="none" stroke="#e15270" stroke-width="0.5"/>
                            <circle cx="50" cy="50" r="25" fill="none" stroke="#e15270" stroke-width="0.5"/>
                            <g>
                                <path fill="none" stroke="#e15270" stroke-width="0.5" d="M50,5 C70,20 80,40 50,95 C20,40 30,20 50,5Z"/>
                                <path fill="none" stroke="#e15270" stroke-width="0.5" d="M5,50 C20,70 40,80 95,50 C40,20 20,30 5,50Z"/>
                                <path fill="none" stroke="#e15270" stroke-width="0.5" d="M95,50 C80,30 60,20 5,50 C60,80 80,70 95,50Z"/>
                                <path fill="none" stroke="#e15270" stroke-width="0.5" d="M50,95 C30,80 20,60 50,5 C80,60 70,80 50,95Z"/>
                            </g>
                        </svg>
                        <svg class="meditation-figure" viewBox="0 0 100 100">
                            <circle cx="50" cy="35" r="12" fill="#732ddb" opacity="0.8"/>
                            <path fill="#732ddb" opacity="0.8" d="M38,45 C38,65 62,65 62,45 C52,55 48,55 38,45Z"/>
                            <path fill="#732ddb" opacity="0.8" d="M30,70 C30,80 70,80 70,70 C60,90 40,90 30,70Z"/>
                        </svg>
                    </div>
                    <div class="form-section">
                        <h2>Begin Your Journey</h2>
                        <div class="input-group">
                            <input type="text" id="signup-name" required>
                            <label for="signup-name">Full Name</label>
                        </div>
                        <div class="input-group">
                            <input type="email" id="signup-email" required>
                            <label for="signup-email">Email</label>
                        </div>
                        <div class="input-group">
                            <input type="password" id="signup-password" required>
                            <label for="signup-password">Password</label>
                        </div>
                        <button type="button">Join Now</button>
                        <div class="toggle-form">
                            <span>Already have an account?</span>
                            <button class="toggle-btn" id="toggle-to-login">Sign In</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

        <?php include "./components/footer.php";
            echo Footer();
        ?>
</body>

</html>