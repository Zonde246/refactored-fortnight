<?php
/**
 * Simplified Attendance API
 * 
 * Handles attendance tracking for courses
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
        // Validate required parameters
        if (!isset($_GET['course']) || !isset($_GET['date'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Course ID and date are required parameters'
            ]);
            exit;
        }
        
        $courseId = $_GET['course'];
        $date = $_GET['date'];
        
        // Validate date format
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid date format. Use YYYY-MM-DD.'
            ]);
            exit;
        }
        
        // Get all participants enrolled in the course
        $stmt = $pdo->prepare("
            SELECT 
                p.id,
                p.first_name,
                p.last_name,
                p.email,
                a.present,
                a.note
            FROM participants p
            JOIN participant_courses pc ON p.id = pc.participant_id
            LEFT JOIN attendance a ON p.id = a.participant_id AND a.course_id = ? AND a.date = ?
            WHERE pc.course_id = ?
            ORDER BY p.last_name, p.first_name
        ");
        
        $stmt->execute([$courseId, $date, $courseId]);
        $participants = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Format participant data
        foreach ($participants as &$participant) {
            $participant['firstName'] = $participant['first_name'];
            $participant['lastName'] = $participant['last_name'];
            unset($participant['first_name']);
            unset($participant['last_name']);
            
            // Convert present to boolean
            $participant['present'] = $participant['present'] ? true : false;
        }
        
        echo json_encode([
            'success' => true,
            'participants' => $participants,
            'date' => $date
        ]);
    }
    // Handle POST requests
    elseif ($method === 'POST') {
        // Get request body
        $requestBody = file_get_contents('php://input');
        $data = json_decode($requestBody, true);
        
        // Validate required fields
        if (!isset($data['courseId']) || !isset($data['date']) || !isset($data['attendance']) || !is_array($data['attendance'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Missing required fields: courseId, date, and attendance array'
            ]);
            exit;
        }
        
        // Validate date format
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $data['date'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid date format. Use YYYY-MM-DD.'
            ]);
            exit;
        }
        
        // Start transaction
        $pdo->beginTransaction();
        
        try {
            // Delete existing attendance records for this course and date
            $stmt = $pdo->prepare("
                DELETE FROM attendance
                WHERE course_id = ? AND date = ?
            ");
            $stmt->execute([$data['courseId'], $data['date']]);
            
            // Insert new attendance records
            $stmt = $pdo->prepare("
                INSERT INTO attendance (participant_id, course_id, date, present, note)
                VALUES (?, ?, ?, ?, ?)
            ");
            
            foreach ($data['attendance'] as $record) {
                $stmt->execute([
                    $record['participantId'],
                    $data['courseId'],
                    $data['date'],
                    $record['present'] ? 1 : 0,
                    $record['note'] ?? ''
                ]);
            }
            
            $pdo->commit();
            
            echo json_encode([
                'success' => true,
                'message' => 'Attendance saved successfully'
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
    error_log("Attendance API error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}