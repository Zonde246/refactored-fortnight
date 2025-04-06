<?php
/**
 * Logout API
 * 
 * Handles user logout by destroying the session
 */

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Set response header for JSON
header('Content-Type: application/json');

// Clear session
$_SESSION = [];

// Clear session cookie
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Destroy session
session_destroy();

// Return success response
echo json_encode([
    'success' => true,
    'message' => 'Logout successful'
]);