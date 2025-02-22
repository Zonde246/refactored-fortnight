<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="/styles/navbar.css">
    <link rel="stylesheet" href="/styles/typography.css">
    <link rel="stylesheet" href="/styles/login.css">
    <title>Document</title>
</head>

<body>
    <?php include './components/navbar.php'; ?>
    <div class="main-container">
        <div class="sub-container">
            <div class="container">
                <img src="/public/temple.jpeg" width="100%" height="100%" class="img" />
            </div>
            <div class="container">
                <h1>Login</h1>
                <form action="./login.php" method="POST" class="login-form">
                    <table>
                        <tr>
                            <td>
                                <label for="username">Username</label>
                            </td>
                            <td>
                                <input type="text" name="username" id="username" required>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <label for="password">Password</label>
                            </td>
                            <td>
                                <input type="password" name="password" id="password" required>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2" class="center"> Already a user? </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                <button type="submit">Login</button>
                            </td>
                        </tr>
                    </table>
                </form>
            </div>
        </div>
    </div>
</body>

</html>