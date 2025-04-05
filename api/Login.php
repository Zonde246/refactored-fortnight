<?php
require __DIR__ . '/../vendor/autoload.php';



$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);

$dotenv->load();

$url = "localhost";
$username = $_ENV["DB_USER"];
$password = $_ENV["DB_PASSWORD"];


try {
    $conn = new PDO("mysql:host=$url;dbname=test", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "Connected successfully";
} catch(PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
