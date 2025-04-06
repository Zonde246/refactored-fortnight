<?php
/**
 * Simplified Courses API
 * 
 * Handles CRUD operations for courses
 */

// Include database configuration
require_once __DIR__ . '/../config.php';

// Start session and check for authentication
session_start();
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized. Please log in.'
    ]);
    exit;
}

// Set content type to JSON
header('Content-Type: application/json');

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

try {
    $pdo = getDbConnection();
    
    // Handle GET requests
    if ($method === 'GET') {
        // Check if we need a specific course
        if (isset($_GET['id'])) {
            $courseId = $_GET['id'];
            
            $stmt = $pdo->prepare("
                SELECT id, name, start_date, end_date, time, location, capacity, description, days
                FROM courses
                WHERE id = ?
            ");
            $stmt->execute([$courseId]);
            $course = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$course) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Course not found'
                ]);
                exit;
            }
            
            // Parse days from JSON
            $course['days'] = json_decode($course['days']);
            
            echo json_encode([
                'success' => true,
                'course' => $course
            ]);
            exit;
        }
        
        // Check if we need upcoming classes
        if (isset($_GET['upcoming']) && $_GET['upcoming'] === 'true') {
            $currentDate = date('Y-m-d');
            
            // Simpler query for getting upcoming courses
            $stmt = $pdo->prepare("
                SELECT 
                    c.id, 
                    c.name, 
                    c.start_date,
                    c.end_date,
                    c.time, 
                    c.location, 
                    c.capacity, 
                    c.days,
                    (
                        SELECT COUNT(*)
                        FROM participant_courses pc
                        WHERE pc.course_id = c.id
                    ) as enrolled,
                    ? as next_date
                FROM courses c
                WHERE c.end_date >= ?
                ORDER BY c.start_date
                LIMIT 3
            ");
            
            // Using tomorrow's date as a placeholder for next_date
            $tomorrow = date('Y-m-d', strtotime('+1 day'));
            $stmt->execute([$tomorrow, $currentDate]);
            $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Format the data
            foreach ($courses as &$course) {
                $course['days'] = json_decode($course['days']);
                $course['nextDate'] = $course['next_date'];
                unset($course['next_date']);
            }
            
            echo json_encode([
                'success' => true,
                'courses' => $courses
            ]);
            exit;
        }
        
        // Check if we need active courses
        if (isset($_GET['active']) && $_GET['active'] === 'true') {
            $currentDate = date('Y-m-d');
            
            $stmt = $pdo->prepare("
                SELECT id, name
                FROM courses
                WHERE end_date >= ?
                ORDER BY name
            ");
            $stmt->execute([$currentDate]);
            $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'courses' => $courses
            ]);
            exit;
        }
        
        // Check if we need all courses for select lists
        if (isset($_GET['all']) && $_GET['all'] === 'true') {
            $stmt = $pdo->query("
                SELECT id, name
                FROM courses
                ORDER BY name
            ");
            $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'courses' => $courses
            ]);
            exit;
        }
        
        // Pagination
        $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
        $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 6;
        $offset = ($page - 1) * $limit;
        
        // Get total count
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM courses");
        $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        // Get paginated courses with simple query
        $stmt = $pdo->prepare("
            SELECT 
                c.id, 
                c.name, 
                c.start_date, 
                c.end_date, 
                c.time, 
                c.location, 
                c.capacity, 
                c.days,
                (
                    SELECT COUNT(*)
                    FROM participant_courses pc
                    WHERE pc.course_id = c.id
                ) as enrolled
            FROM courses c
            ORDER BY c.start_date DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        $stmt->bindValue(2, $offset, PDO::PARAM_INT);
        $stmt->execute();
        $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Format the data
        foreach ($courses as &$course) {
            $course['days'] = json_decode($course['days']);
            $course['startDate'] = $course['start_date'];
            $course['endDate'] = $course['end_date'];
            unset($course['start_date']);
            unset($course['end_date']);
        }
        
        echo json_encode([
            'success' => true,
            'courses' => $courses,
            'total' => $total,
            'page' => $page,
            'limit' => $limit
        ]);
    }
    // Handle POST requests (Create)
    elseif ($method === 'POST') {
        // Get request body
        $requestBody = file_get_contents('php://input');
        $data = json_decode($requestBody, true);
        
        // Validate required fields
        $requiredFields = ['name', 'startDate', 'endDate', 'days', 'time', 'location', 'capacity'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Missing required field: ' . $field
                ]);
                exit;
            }
        }
        
        // Encode days as JSON
        $daysJson = json_encode($data['days']);
        
        // Insert new course
        $stmt = $pdo->prepare("
            INSERT INTO courses (name, start_date, end_date, days, time, location, capacity, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $data['name'],
            $data['startDate'],
            $data['endDate'],
            $daysJson,
            $data['time'],
            $data['location'],
            $data['capacity'],
            $data['description'] ?? ''
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Course created successfully',
            'courseId' => $pdo->lastInsertId()
        ]);
    }
    // Handle PUT requests (Update)
    elseif ($method === 'PUT') {
        // Get request body
        $requestBody = file_get_contents('php://input');
        $data = json_decode($requestBody, true);
        
        // Validate course ID
        if (!isset($data['id']) || empty($data['id'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Course ID is required for updating'
            ]);
            exit;
        }
        
        // Validate required fields
        $requiredFields = ['name', 'startDate', 'endDate', 'days', 'time', 'location', 'capacity'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Missing required field: ' . $field
                ]);
                exit;
            }
        }
        
        // Encode days as JSON
        $daysJson = json_encode($data['days']);
        
        // Update course
        $stmt = $pdo->prepare("
            UPDATE courses
            SET name = ?,
                start_date = ?,
                end_date = ?,
                days = ?,
                time = ?,
                location = ?,
                capacity = ?,
                description = ?
            WHERE id = ?
        ");
        
        $stmt->execute([
            $data['name'],
            $data['startDate'],
            $data['endDate'],
            $daysJson,
            $data['time'],
            $data['location'],
            $data['capacity'],
            $data['description'] ?? '',
            $data['id']
        ]);
        
        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Course not found or no changes made'
            ]);
            exit;
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Course updated successfully'
        ]);
    }
    // Handle DELETE requests
    elseif ($method === 'DELETE') {
        // Check if course ID is provided
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Course ID is required for deletion'
            ]);
            exit;
        }
        
        $courseId = $_GET['id'];
        
        // Start transaction
        $pdo->beginTransaction();
        
        try {
            // Delete attendance records for this course
            $stmt = $pdo->prepare("
                DELETE FROM attendance
                WHERE course_id = ?
            ");
            $stmt->execute([$courseId]);
            
            // Delete participant course relationships
            $stmt = $pdo->prepare("
                DELETE FROM participant_courses
                WHERE course_id = ?
            ");
            $stmt->execute([$courseId]);
            
            // Delete course
            $stmt = $pdo->prepare("
                DELETE FROM courses
                WHERE id = ?
            ");
            $stmt->execute([$courseId]);
            
            if ($stmt->rowCount() === 0) {
                $pdo->rollBack();
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Course not found'
                ]);
                exit;
            }
            
            $pdo->commit();
            
            echo json_encode([
                'success' => true,
                'message' => 'Course deleted successfully'
            ]);
        } catch (Exception $e) {
            $pdo->rollBack();
            throw $e;
        }
    }
    // Handle unsupported methods
    else {
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => 'Method not allowed'
        ]);
    }
} catch (Exception $e) {
    error_log("Courses API error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}