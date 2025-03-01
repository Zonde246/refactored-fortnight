<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="/styles/navbar.css">
    <link rel="stylesheet" href="/styles/main.css">
    <link rel="stylesheet" href="/styles/login.css">
    <title>Document</title>
</head>

<body>
    <?php include './components/navbar.php'; ?>
    <div class="main-container">
        <div class="sub-container">
            <div class="container">
                <h1>Sign up!</h1>
                <form action="./login.php" method="POST" class="login-form">
                    <table>
                        <tr>
                            <td>
                                <label for="email">Email</label>
                            </td>
                            <td>
                                <input type="email" name="email" id="email" required>
                            </td>
                        </tr>
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
                                <label for="address">Address</label>
                            </td>
                            <td>
                                <input type="text" name="address" id="address" required>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <label for="dob">Date of Birth</label>
                            </td>
                            <td>
                                <input type="date" name="dob" id="dob" required>
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
                            <td>
                                <label for="password">Confirm Password</label>
                            </td>
                            <td>
                                <input type="password" name="password" id="password" required>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2" class="center"> <a href="login.php">Already a user? </a> </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                <button type="submit">Signup</button>
                            </td>
                        </tr>
                    </table>
                    </form>
                </div>
            <div class="container">
                <img src="public/temple.jpeg" width="100%" height="100%" class="img" alt="judgement"/>
            </div>
            </div>
        </div>
</body>

</html>