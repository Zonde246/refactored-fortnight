<?php
// api/user_courses.php
session_start();

// Include database config
require_once __DIR__ . '/../config.php';

// Set content type to JSON
header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    echo json_encode([
        'success' => false,
        'message' => 'User not authenticated'
    ]);
    exit;
}

// Get user ID from session
$userId = $_SESSION['user_id'];

try {
    // Get database connection
    $pdo = getDbConnection();
    
    // Modified query to handle collation issues by explicitly converting collations
    // or by using a user_id-based approach rather than joining on email
    
    // First approach: Using user_id if your participants table has a user_id column
    $stmt = $pdo->prepare("
        SELECT c.*, pc.status, pc.enrolled_date
        FROM courses c
        JOIN participant_courses pc ON c.id = pc.course_id
        WHERE pc.participant_id IN (
            SELECT p.id FROM participants p 
            WHERE p.id = :user_id
        )
        ORDER BY c.start_date DESC
    ");
    
    // Alternative approach: If you don't have user_id in participants table, 
    // but need to join through email, force collation explicitly
    /*
    $stmt = $pdo->prepare("
        SELECT c.*, pc.status, pc.enrolled_date
        FROM courses c
        JOIN participant_courses pc ON c.id = pc.course_id
        JOIN participants p ON pc.participant_id = p.id
        JOIN users u ON p.email COLLATE utf8mb4_unicode_ci = u.email COLLATE utf8mb4_unicode_ci
        WHERE u.id = :user_id
        ORDER BY c.start_date DESC
    ");
    */
    
    $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
    $stmt->execute();
    
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format days field (assuming it's stored as JSON or serialized data)
    foreach ($courses as &$course) {
        // If days is stored as JSON
        if (isset($course['days']) && $course['days']) {
            // Attempt to decode JSON
            $decodedDays = json_decode($course['days'], true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decodedDays)) {
                $course['days'] = implode(', ', $decodedDays);
            }
        }
        
        // Format time (if it's stored as HH:MM:SS)
        if (isset($course['time'])) {
            $timeObj = new DateTime($course['time']);
            $course['time'] = $timeObj->format('h:i A');
        }
    }
    
    echo json_encode([
        'success' => true,
        'courses' => $courses
    ]);
    
} catch (PDOException $e) {
    // Log error (but don't expose details to client)
    error_log("Database error in user_courses.php: " . $e->getMessage());
    
    echo json_encode([
        'success' => false,
        'message' => 'Error retrieving course data'
    ]);
}