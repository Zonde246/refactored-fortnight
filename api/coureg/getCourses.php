<?php
// api/getCourses.php
// Returns all available courses

// Database connection
require_once __DIR__ . '/../config.php';

// Set response header for JSON
header('Content-Type: application/json');

try {
    // Create database connection
    $conn = getDbConnection();
    
    // Query to get all courses
    $stmt = $conn->prepare("SELECT * FROM courses");
    $stmt->execute();
    
    // Fetch all courses as associative array
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Return courses as JSON
    echo json_encode($courses);
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