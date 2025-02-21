<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    <?php
    if (isset($_GET['error'])) {
        echo "Invalid username or password";
    }
    ?>
    <form action="index.php" method="post">
        <input type="text" name="username" />
        <input type="password" name="password" />
        <button> Login </button>
    </form>
</body>

</html>