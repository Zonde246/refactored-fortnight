<?php
// api/user.php - Returns user information if logged in

// Include database connection
require_once __DIR__ . '/config.php';

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Set headers
header('Content-Type: application/json');

// Initialize response array
$response = [
    'success' => false,
    'message' => '',
    'data' => [
        'logged_in' => false,
        'user' => null
    ]
];

// Handle GET request to check if user is logged in
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Check if user is logged in
        if (isset($_SESSION['user_id'])) {
            $userId = $_SESSION['user_id'];
            
            // Connect to database
            $pdo = getDbConnection();
            
            // Get user data
            $sql = "SELECT id, name, email, status, role FROM users WHERE id = :user_id AND status = 'active'";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':user_id' => $userId]);
            
            $user = $stmt->fetch();
            
            if ($user) {
                $response['success'] = true;
                $response['data'] = [
                    'logged_in' => true,
                    'user' => $user
                ];
            } else {
                // User not found or not active, clear session
                session_unset();
                session_destroy();
            }
        }
    } catch (Exception $e) {
        $response['message'] = 'Error: ' . $e->getMessage();
    }
    
    echo json_encode($response);
    exit;
}

// If we get here, no valid action was requested
$response['message'] = 'Invalid request method';
echo json_encode($response);