<?php
/**
 * Simplified Participants API
 * 
 * Handles CRUD operations for participants
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
        // Check if we need a specific participant
        if (isset($_GET['id'])) {
            $participantId = $_GET['id'];
            
            $stmt = $pdo->prepare("
                SELECT 
                    p.id, 
                    p.first_name, 
                    p.last_name, 
                    p.email, 
                    p.phone, 
                    p.address, 
                    p.status, 
                    p.notes
                FROM participants p
                WHERE p.id = ?
            ");
            $stmt->execute([$participantId]);
            $participant = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$participant) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Participant not found'
                ]);
                exit;
            }
            
            // Format participant data
            $participant['firstName'] = $participant['first_name'];
            $participant['lastName'] = $participant['last_name'];
            unset($participant['first_name']);
            unset($participant['last_name']);
            
            // Get enrolled courses
            $stmt = $pdo->prepare("
                SELECT c.id
                FROM courses c
                JOIN participant_courses pc ON c.id = pc.course_id
                WHERE pc.participant_id = ?
            ");
            $stmt->execute([$participantId]);
            $courses = $stmt->fetchAll(PDO::FETCH_COLUMN);
            
            $participant['courseIds'] = $courses;
            
            echo json_encode([
                'success' => true,
                'participant' => $participant
            ]);
            exit;
        }
        
        // Pagination and filtering
        $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
        $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
        $offset = ($page - 1) * $limit;
        
        // Build query conditions
        $conditions = [];
        $params = [];
        
        if (isset($_GET['search']) && !empty($_GET['search'])) {
            $conditions[] = "(p.first_name LIKE ? OR p.last_name LIKE ? OR p.email LIKE ? OR p.phone LIKE ?)";
            $searchTerm = '%' . $_GET['search'] . '%';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }
        
        if (isset($_GET['status']) && !empty($_GET['status'])) {
            $conditions[] = "p.status = ?";
            $params[] = $_GET['status'];
        }
        
        // Building the WHERE clause
        $whereClause = count($conditions) > 0 ? "WHERE " . implode(" AND ", $conditions) : "";
        
        // Count total participants with the filter
        $countQuery = "SELECT COUNT(*) FROM participants p $whereClause";
        $countStmt = $pdo->prepare($countQuery);
        $countStmt->execute($params);
        $total = $countStmt->fetchColumn();
        
        // Query participants with filter and pagination
        $query = "
            SELECT 
                p.id, 
                p.first_name, 
                p.last_name, 
                p.email, 
                p.phone, 
                p.status
            FROM participants p
            $whereClause
            ORDER BY p.last_name, p.first_name
            LIMIT ? OFFSET ?
        ";
        
        $stmt = $pdo->prepare($query);
        
        // Bind all filter parameters first
        $paramPosition = 1;
        foreach ($params as $param) {
            $stmt->bindValue($paramPosition++, $param);
        }
        
        // Then bind pagination parameters
        $stmt->bindValue($paramPosition++, $limit, PDO::PARAM_INT);
        $stmt->bindValue($paramPosition++, $offset, PDO::PARAM_INT);
        
        $stmt->execute();
        $participants = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Format participant data and get courses
        foreach ($participants as &$participant) {
            $participant['firstName'] = $participant['first_name'];
            $participant['lastName'] = $participant['last_name'];
            unset($participant['first_name']);
            unset($participant['last_name']);
            
            // Get the courses for this participant
            $courseStmt = $pdo->prepare("
                SELECT c.name
                FROM courses c
                JOIN participant_courses pc ON c.id = pc.course_id
                WHERE pc.participant_id = ?
            ");
            $courseStmt->execute([$participant['id']]);
            $participant['courses'] = $courseStmt->fetchAll(PDO::FETCH_COLUMN);
        }
        
        echo json_encode([
            'success' => true,
            'participants' => $participants,
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
        $requiredFields = ['firstName', 'lastName', 'email', 'phone'];
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
        
        // Start transaction
        $pdo->beginTransaction();
        
        try {
            // Insert new participant
            $stmt = $pdo->prepare("
                INSERT INTO participants (first_name, last_name, email, phone, address, status, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $data['firstName'],
                $data['lastName'],
                $data['email'],
                $data['phone'],
                $data['address'] ?? '',
                $data['status'] ?? 'active',
                $data['notes'] ?? ''
            ]);
            
            $participantId = $pdo->lastInsertId();
            
            // Insert course enrollments if provided
            if (isset($data['courses']) && is_array($data['courses']) && !empty($data['courses'])) {
                $enrollmentStmt = $pdo->prepare("
                    INSERT INTO participant_courses (participant_id, course_id, enrolled_date)
                    VALUES (?, ?, ?)
                ");
                
                $currentDate = date('Y-m-d');
                
                foreach ($data['courses'] as $courseId) {
                    $enrollmentStmt->execute([
                        $participantId,
                        $courseId,
                        $currentDate
                    ]);
                }
            }
            
            $pdo->commit();
            
            echo json_encode([
                'success' => true,
                'message' => 'Participant created successfully',
                'participantId' => $participantId
            ]);
        } catch (Exception $e) {
            $pdo->rollBack();
            throw $e;
        }
    }
    // Handle PUT requests (Update)
    elseif ($method === 'PUT') {
        // Get request body
        $requestBody = file_get_contents('php://input');
        $data = json_decode($requestBody, true);
        
        // Validate participant ID
        if (!isset($data['id']) || empty($data['id'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Participant ID is required for updating'
            ]);
            exit;
        }
        
        // Validate required fields
        $requiredFields = ['firstName', 'lastName', 'email', 'phone'];
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
        
        // Start transaction
        $pdo->beginTransaction();
        
        try {
            // Update participant
            $stmt = $pdo->prepare("
                UPDATE participants
                SET first_name = ?,
                    last_name = ?,
                    email = ?,
                    phone = ?,
                    address = ?,
                    status = ?,
                    notes = ?
                WHERE id = ?
            ");
            
            $stmt->execute([
                $data['firstName'],
                $data['lastName'],
                $data['email'],
                $data['phone'],
                $data['address'] ?? '',
                $data['status'] ?? 'active',
                $data['notes'] ?? '',
                $data['id']
            ]);
            
            if ($stmt->rowCount() === 0) {
                $pdo->rollBack();
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Participant not found or no changes made'
                ]);
                exit;
            }
            
            // Update course enrollments if provided
            if (isset($data['courses']) && is_array($data['courses'])) {
                // Delete existing enrollments
                $deleteStmt = $pdo->prepare("
                    DELETE FROM participant_courses
                    WHERE participant_id = ?
                ");
                $deleteStmt->execute([$data['id']]);
                
                // Insert new enrollments
                if (!empty($data['courses'])) {
                    $enrollmentStmt = $pdo->prepare("
                        INSERT INTO participant_courses (participant_id, course_id, enrolled_date)
                        VALUES (?, ?, ?)
                    ");
                    
                    $currentDate = date('Y-m-d');
                    
                    foreach ($data['courses'] as $courseId) {
                        $enrollmentStmt->execute([
                            $data['id'],
                            $courseId,
                            $currentDate
                        ]);
                    }
                }
            }
            
            $pdo->commit();
            
            echo json_encode([
                'success' => true,
                'message' => 'Participant updated successfully'
            ]);
        } catch (Exception $e) {
            $pdo->rollBack();
            throw $e;
        }
    }
    // Handle DELETE requests
    elseif ($method === 'DELETE') {
        // Check if participant ID is provided
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Participant ID is required for deletion'
            ]);
            exit;
        }
        
        $participantId = $_GET['id'];
        
        // Start transaction
        $pdo->beginTransaction();
        
        try {
            // Delete attendance records
            $stmt = $pdo->prepare("
                DELETE FROM attendance
                WHERE participant_id = ?
            ");
            $stmt->execute([$participantId]);
            
            // Delete course enrollments
            $stmt = $pdo->prepare("
                DELETE FROM participant_courses
                WHERE participant_id = ?
            ");
            $stmt->execute([$participantId]);
            
            // Delete participant
            $stmt = $pdo->prepare("
                DELETE FROM participants
                WHERE id = ?
            ");
            $stmt->execute([$participantId]);
            
            if ($stmt->rowCount() === 0) {
                $pdo->rollBack();
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Participant not found'
                ]);
                exit;
            }
            
            $pdo->commit();
            
            echo json_encode([
                'success' => true,
                'message' => 'Participant deleted successfully'
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
    error_log("Participants API error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}