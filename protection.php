<?php
// Authentication and role-based access control
session_start();

// Check if user is logged in
$isAuthorized = false;
if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
    $isAuthorized = true;
}

// If not logged in, redirect to login page
if (!$isAuthorized) {
    // Unauthorized - redirect to login
    header('Location: /index.html');
    exit;
}

// Check if file parameter exists
if (!isset($_GET['file'])) {
    header("HTTP/1.0 400 Bad Request");
    exit("File parameter is required");
}

// Security check to prevent directory traversal
if (strpos($_GET['file'], '..') !== false || strpos($_GET['file'], '/') !== false) {
    header("HTTP/1.0 403 Forbidden");
    exit("Invalid file path");
}

// Define restricted files that require specific roles
$restrictedFiles = [
    'empView.html' => ['employee', 'admin'],
    'Dash.php' => ['employee', 'admin']
    // Add more restricted files and allowed roles as needed
];

$requestedFile = $_GET['file'];
$filePath = 'prot/' . $requestedFile;

// Check if the requested file exists
if (!file_exists($filePath)) {
    header("HTTP/1.0 404 Not Found");
    header('Location: /err.php');
    exit;
}

// Check if the file requires specific role access
if (array_key_exists($requestedFile, $restrictedFiles)) {
    // Get the current user's role
    $userRole = isset($_SESSION['user_role']) ? $_SESSION['user_role'] : 'user';
    
    // Check if user's role is allowed to access this file
    if (!in_array($userRole, $restrictedFiles[$requestedFile])) {
        // User doesn't have the required role
        header("HTTP/1.0 403 Forbidden");
        
        // Log the unauthorized access attempt
        error_log("Unauthorized access attempt to {$requestedFile} by user {$_SESSION['user_id']} with role {$userRole}");
        
        // Redirect to an access denied page
        header('Location: /prot/unauthorized.php');
        exit;
    }
}

// User is authorized to view the file
include($filePath);
?>