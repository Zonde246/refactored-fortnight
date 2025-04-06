<?php
// api/getEnrollments.php
// Returns enrollments for a specific user

// Database connection
require_once __DIR__ . '/../config.php';

// Set response header for JSON
header('Content-Type: application/json');

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Get user ID from request or session
$userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

// If no user ID provided, use the session user ID
if ($userId <= 0 && isset($_SESSION['user_id'])) {
    $userId = $_SESSION['user_id'];
}

// Validate user ID
if ($userId <= 0) {
    echo json_encode([
        'error' => true,
        'message' => "Invalid user ID"
    ]);
    exit;
}

try {
    // Create database connection
    $conn = getDbConnection();
    
    // First check if the user exists in participants table
    $checkParticipantStmt = $conn->prepare("SELECT id FROM participants WHERE id = :user_id");
    $checkParticipantStmt->bindParam(':user_id', $userId);
    $checkParticipantStmt->execute();
    
    if ($checkParticipantStmt->rowCount() === 0) {
        // If user is not in participants table, they have no enrollments
        echo json_encode([]);
        exit;
    }
    
    // Get participant ID (which is the same as user ID in our case)
    $participantId = $userId;
    
    // Query to get enrollments for the participant
    $stmt = $conn->prepare(
        "SELECT pc.*, c.name as course_name 
         FROM participant_courses pc
         JOIN courses c ON pc.course_id = c.id
         WHERE pc.participant_id = :participant_id"
    );
    $stmt->bindParam(':participant_id', $participantId);
    $stmt->execute();
    
    // Fetch all enrollments as associative array
    $enrollments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Return enrollments as JSON
    echo json_encode($enrollments);
} catch(PDOException $e) {
    // Return error message
    echo json_encode([
        'error' => true,
        'message' => "Database error: " . $e->getMessage()
    ]);
}

// Close connection
$conn = null;
?>