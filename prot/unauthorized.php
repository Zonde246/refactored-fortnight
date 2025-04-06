<?php
// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check if user is logged in
$isLoggedIn = isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true;
$userName = $_SESSION['user_name'] ?? 'Guest';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Unauthorized Access - Ashram Community Management</title>
    <style>
        :root {
            --dark: #07020d;      /* Deep black/purple */
            --light: #f6f1fd;     /* Light lavender */
            --primary: #732ddb;   /* Vibrant purple */
            --secondary: #eb8dc4; /* Pink */
            --accent: #e15270;    /* Coral/red */
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
            background-color: var(--light);
            color: var(--dark);
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
        }
        
        .container {
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            padding: 40px;
            width: 500px;
            max-width: 100%;
            border-top: 5px solid var(--accent);
        }
        
        .icon {
            font-size: 4rem;
            color: var(--accent);
            margin-bottom: 20px;
        }
        
        h1 {
            color: var(--accent);
            margin-bottom: 20px;
        }
        
        p {
            margin-bottom: 30px;
            line-height: 1.6;
        }
        
        .btn {
            display: inline-block;
            padding: 10px 20px;
            background-color: var(--primary);
            color: white;
            text-decoration: none;
            border-radius: 5px;
            transition: background-color 0.3s;
        }
        
        .btn:hover {
            background-color: #6023b9;
        }
    </style>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <div class="container">
        <div class="icon">
            <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h1>Unauthorized Access</h1>
        <p>
            Namaste, <?php echo htmlspecialchars($userName); ?>!<br>
            You do not have permission to access this area.
            This section is restricted to administrators and staff members only.
        </p>
        <?php if ($isLoggedIn): ?>
            <a href="index.php" class="btn">Return to Home</a>
        <?php else: ?>
            <a href="login.php" class="btn">Return to Login</a>
        <?php endif; ?>
    </div>
</body>
</html>