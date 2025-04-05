<?php
// Start session
session_start();

// Set response header for JSON
header('Content-Type: application/json');

// Check if user is logged in
if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
    // User is authenticated, return user data
    echo json_encode([
        'authenticated' => true,
        'user' => [
            'id' => $_SESSION['user_id'] ?? null,
            'name' => $_SESSION['user_name'] ?? null,
            'email' => $_SESSION['user_email'] ?? null,
            'role' => $_SESSION['user_role'] ?? 'user'
        ]
    ]);
} else {
    // User is not authenticated
    echo json_encode([
        'authenticated' => false,
        'user' => null
    ]);
}