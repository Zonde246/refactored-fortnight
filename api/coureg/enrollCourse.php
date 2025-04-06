<?php
// api/enrollCourse.php
// Enrolls a user in a course

// Database connection
require_once __DIR__ . '/../config.php';

// Set response header for JSON
header('Content-Type: application/json');

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check if user is logged in
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    echo json_encode([
        'success' => false,
        'message' => "You must be logged in to enroll in courses"
    ]);
    exit;
}

// Get data from POST request
$userId = isset($_POST['user_id']) ? intval($_POST['user_id']) : 0;
$courseId = isset($_POST['course_id']) ? intval($_POST['course_id']) : 0;

// Validate input
if ($courseId <= 0) {
    echo json_encode([
        'success' => false,
        'message' => "Invalid course ID"
    ]);
    exit;
}

// Always use the logged-in user's ID from the session
$userId = $_SESSION['user_id'];

try {
    // Create database connection
    $conn = getDbConnection();
    
    // Begin transaction
    $conn->beginTransaction();
    
    // First, check if the user exists in the participants table
    $checkParticipantStmt = $conn->prepare("SELECT id FROM participants WHERE id = :user_id");
    $checkParticipantStmt->bindParam(':user_id', $userId);
    $checkParticipantStmt->execute();
    
    $participantId = 0;
    
    if ($checkParticipantStmt->rowCount() > 0) {
        // User exists in participants table, use their ID
        $participantData = $checkParticipantStmt->fetch(PDO::FETCH_ASSOC);
        $participantId = $participantData['id'];
    } else {
        // Find user info from users table
        $userStmt = $conn->prepare("SELECT name, email FROM users WHERE id = :user_id");
        $userStmt->bindParam(':user_id', $userId);
        $userStmt->execute();
        
        if ($userStmt->rowCount() > 0) {
            $userData = $userStmt->fetch(PDO::FETCH_ASSOC);
            
            // Split name into first and last name
            $nameParts = explode(' ', $userData['name'], 2);
            $firstName = $nameParts[0];
            $lastName = isset($nameParts[1]) ? $nameParts[1] : '';
            
            // Insert the user into participants table
            $insertParticipantStmt = $conn->prepare(
                "INSERT INTO participants (id, first_name, last_name, email, status, created_at, updated_at) 
                 VALUES (:user_id, :first_name, :last_name, :email, 'active', NOW(), NOW())"
            );
            
            $insertParticipantStmt->bindParam(':user_id', $userId);
            $insertParticipantStmt->bindParam(':first_name', $firstName);
            $insertParticipantStmt->bindParam(':last_name', $lastName);
            $insertParticipantStmt->bindParam(':email', $userData['email']);
            $insertParticipantStmt->execute();
            
            $participantId = $userId;
        } else {
            // User not found in users table
            $conn->rollBack();
            echo json_encode([
                'success' => false,
                'message' => "User account not found"
            ]);
            exit;
        }
    }
    
    // Check if participant is already enrolled in this course
    $checkStmt = $conn->prepare("SELECT * FROM participant_courses 
                                WHERE participant_id = :participant_id AND course_id = :course_id");
    $checkStmt->bindParam(':participant_id', $participantId);
    $checkStmt->bindParam(':course_id', $courseId);
    $checkStmt->execute();
    
    if ($checkStmt->rowCount() > 0) {
        // Participant is already enrolled
        $conn->rollBack();
        echo json_encode([
            'success' => false,
            'message' => "You are already enrolled in this course"
        ]);
        exit;
    }
    
    // Check course capacity
    $capacityStmt = $conn->prepare("SELECT c.capacity, COUNT(pc.participant_id) as enrolled
                                    FROM courses c
                                    LEFT JOIN participant_courses pc ON c.id = pc.course_id
                                    WHERE c.id = :course_id
                                    GROUP BY c.id");
    $capacityStmt->bindParam(':course_id', $courseId);
    $capacityStmt->execute();
    $capacityData = $capacityStmt->fetch(PDO::FETCH_ASSOC);
    
    if ($capacityData && $capacityData['enrolled'] >= $capacityData['capacity']) {
        // Course is full
        $conn->rollBack();
        echo json_encode([
            'success' => false,
            'message' => "This course is at full capacity"
        ]);
        exit;
    }
    
    // Prepare insert statement
    $stmt = $conn->prepare("INSERT INTO participant_courses 
                          (participant_id, course_id, enrolled_date, status, created_at, updated_at) 
                          VALUES (:participant_id, :course_id, :enrolled_date, 'active', NOW(), NOW())");
    
    // Current date for enrollment
    $enrolledDate = date('Y-m-d');
    
    // Bind parameters
    $stmt->bindParam(':participant_id', $participantId);
    $stmt->bindParam(':course_id', $courseId);
    $stmt->bindParam(':enrolled_date', $enrolledDate);
    
    // Execute statement
    $stmt->execute();
    
    // Commit transaction
    $conn->commit();
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => "Successfully enrolled in the course"
    ]);
} catch(PDOException $e) {
    // Rollback transaction on error
    if ($conn && $conn->inTransaction()) {
        $conn->rollBack();
    }
    
    // Return error message
    echo json_encode([
        'success' => false,
        'message' => "Database error: " . $e->getMessage()
    ]);
}

// Close connection
$conn = null;
?>