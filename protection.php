<?php
// Authentication/validation logic here
session_start();

// Check if user is authorized
$isAuthorized = false;

// Your authorization logic (example)
if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
    $isAuthorized = true;
}

if (!$isAuthorized) {
    // Unauthorized - redirect to login
    header('Location: /login.php');
    exit;
}

// Authorized - serve the requested file
if (isset($_GET['file'])) {
    $filePath = 'prot/' . $_GET['file'];
    // Security check to prevent directory traversal
    if (strpos($_GET['file'], '..') !== false) {
        die("Invalid file path");
    }
    
    if (file_exists($filePath)) {
        include($filePath);
    } else {
        header("HTTP/1.0 404 Not Found");
        echo "File not found";
    }
}
?>