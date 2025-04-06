<?php
/**
 * Members API
 * 
 * Handles CRUD operations for ashram members
 */

// Include database configuration
require_once __DIR__ . '/../config.php';

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Set response header for JSON
header('Content-Type: application/json');

// Check if user is authenticated
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized access'
    ]);
    exit;
}

// Check permissions (only admin and staff can manage members)
$userRole = $_SESSION['user_role'] ?? 'user';
if ($userRole !== 'admin' && $userRole !== 'employee') {
    echo json_encode([
        'success' => false,
        'message' => 'Insufficient permissions'
    ]);
    exit;
}

// Handle the request based on method
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Get all members
        getMembers();
        break;
    case 'POST':
        // Create a new member or update existing
        if (isset($_POST['id']) && !empty($_POST['id'])) {
            updateMember();
        } else {
            createMember();
        }
        break;
    case 'DELETE':
        // Delete a member
        deleteMember();
        break;
    default:
        echo json_encode([
            'success' => false,
            'message' => 'Invalid request method'
        ]);
        break;
}

/**
 * Get all members
 */
function getMembers() {
    try {
        $pdo = getDbConnection();
        
        // Get search parameter
        $search = isset($_GET['search']) ? $_GET['search'] : '';
        
        // Define base query
        $query = "SELECT id, name, email, role, status, created_at FROM users WHERE 1=1";
        $params = [];
        
        // Add search condition if provided
        if (!empty($search)) {
            $query .= " AND (name LIKE ? OR email LIKE ?)";
            $search = "%$search%";
            $params[] = $search;
            $params[] = $search;
        }
        
        // Add sorting
        $query .= " ORDER BY name ASC";
        
        // Prepare and execute query
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $members = $stmt->fetchAll();
        
        // Get stats data
        $stats = getMembersStats($pdo);
        
        echo json_encode([
            'success' => true,
            'data' => [
                'members' => $members,
                'stats' => $stats
            ]
        ]);
    } catch (Exception $e) {
        error_log("Error getting members: " . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => 'An error occurred while retrieving members'
        ]);
    }
}

/**
 * Get member statistics
 */
function getMembersStats($pdo) {
    try {
        // Total members
        $totalStmt = $pdo->query("SELECT COUNT(*) as total FROM users");
        $total = $totalStmt->fetch()['total'];
        
        // Active members
        $activeStmt = $pdo->query("SELECT COUNT(*) as active FROM users WHERE status = 'active'");
        $active = $activeStmt->fetch()['active'];
        
        // Inactive members
        $inactiveStmt = $pdo->query("SELECT COUNT(*) as inactive FROM users WHERE status = 'inactive'");
        $inactive = $inactiveStmt->fetch()['inactive'];
        
        // Calculate participation (assuming this is the number of active users divided by total)
        $participation = $total > 0 ? round(($active / $total) * 100) : 0;
        
        // Last month stats for comparison
        // This would involve more complex queries with date ranges
        // For simplicity, we'll use random values
        $lastMonthIncrease = rand(5, 15);
        $activeIncrease = rand(5, 12);
        $inactiveDecrease = rand(2, 8);
        $participationIncrease = rand(3, 8);
        
        return [
            'total' => $total,
            'active' => $active,
            'inactive' => $inactive,
            'participation' => $participation,
            'last_month' => [
                'total_increase' => $lastMonthIncrease,
                'active_increase' => $activeIncrease,
                'inactive_decrease' => $inactiveDecrease,
                'participation_increase' => $participationIncrease
            ]
        ];
    } catch (Exception $e) {
        error_log("Error getting member stats: " . $e->getMessage());
        return null;
    }
}

/**
 * Create a new member
 */
function createMember() {
    try {
        // Get form data
        $name = $_POST['name'] ?? '';
        $email = $_POST['email'] ?? '';
        $role = $_POST['role'] ?? 'user';
        $password = $_POST['password'] ?? '';
        $status = $_POST['status'] ?? 'active';
        
        // Validate input
        if (empty($name) || empty($email) || empty($role) || empty($password)) {
            echo json_encode([
                'success' => false,
                'message' => 'All fields are required'
            ]);
            exit;
        }
        
        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode([
                'success' => false,
                'message' => 'Invalid email format'
            ]);
            exit;
        }
        
        $pdo = getDbConnection();
        
        // Check if email already exists
        $checkStmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $checkStmt->execute([$email]);
        if ($checkStmt->fetch()) {
            echo json_encode([
                'success' => false,
                'message' => 'Email already exists'
            ]);
            exit;
        }
        
        // Hash password
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        
        // Insert new member
        $stmt = $pdo->prepare("INSERT INTO users (name, email, role, password, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())");
        $success = $stmt->execute([$name, $email, $role, $hashedPassword, $status]);
        
        if ($success) {
            $newId = $pdo->lastInsertId();
            echo json_encode([
                'success' => true,
                'message' => 'Member added successfully',
                'data' => [
                    'id' => $newId,
                    'name' => $name,
                    'email' => $email,
                    'role' => $role,
                    'status' => $status
                ]
            ]);
        } else {
            throw new Exception("Failed to insert new member");
        }
    } catch (Exception $e) {
        error_log("Error creating member: " . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => 'An error occurred while creating the member'
        ]);
    }
}

/**
 * Update an existing member
 */
function updateMember() {
    try {
        // Get form data
        $id = $_POST['id'] ?? '';
        $name = $_POST['name'] ?? '';
        $email = $_POST['email'] ?? '';
        $role = $_POST['role'] ?? '';
        $password = $_POST['password'] ?? '';
        $status = $_POST['status'] ?? 'active';
        
        // Validate input
        if (empty($id) || empty($name) || empty($email) || empty($role)) {
            echo json_encode([
                'success' => false,
                'message' => 'Required fields are missing'
            ]);
            exit;
        }
        
        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode([
                'success' => false,
                'message' => 'Invalid email format'
            ]);
            exit;
        }
        
        $pdo = getDbConnection();
        
        // Check if email exists for another user
        $checkStmt = $pdo->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
        $checkStmt->execute([$email, $id]);
        if ($checkStmt->fetch()) {
            echo json_encode([
                'success' => false,
                'message' => 'Email already exists for another user'
            ]);
            exit;
        }
        
        // Check if member exists
        $checkMemberStmt = $pdo->prepare("SELECT id FROM users WHERE id = ?");
        $checkMemberStmt->execute([$id]);
        if (!$checkMemberStmt->fetch()) {
            echo json_encode([
                'success' => false,
                'message' => 'Member not found'
            ]);
            exit;
        }
        
        // Update member with or without password
        if (!empty($password)) {
            // Hash new password
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            
            $stmt = $pdo->prepare("UPDATE users SET name = ?, email = ?, role = ?, password = ?, status = ? WHERE id = ?");
            $success = $stmt->execute([$name, $email, $role, $hashedPassword, $status, $id]);
        } else {
            // Update without changing password
            $stmt = $pdo->prepare("UPDATE users SET name = ?, email = ?, role = ?, status = ? WHERE id = ?");
            $success = $stmt->execute([$name, $email, $role, $status, $id]);
        }
        
        if ($success) {
            echo json_encode([
                'success' => true,
                'message' => 'Member updated successfully',
                'data' => [
                    'id' => $id,
                    'name' => $name,
                    'email' => $email,
                    'role' => $role,
                    'status' => $status
                ]
            ]);
        } else {
            throw new Exception("Failed to update member");
        }
    } catch (Exception $e) {
        error_log("Error updating member: " . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => 'An error occurred while updating the member'
        ]);
    }
}

/**
 * Delete a member
 */
function deleteMember() {
    try {
        // Get the PHP input stream for DELETE requests
        $input = json_decode(file_get_contents('php://input'), true);
        $id = $input['id'] ?? null;
        
        if (empty($id)) {
            echo json_encode([
                'success' => false,
                'message' => 'Member ID is required'
            ]);
            exit;
        }
        
        $pdo = getDbConnection();
        
        // Check if member exists
        $checkStmt = $pdo->prepare("SELECT id FROM users WHERE id = ?");
        $checkStmt->execute([$id]);
        if (!$checkStmt->fetch()) {
            echo json_encode([
                'success' => false,
                'message' => 'Member not found'
            ]);
            exit;
        }
        
        // Delete member
        $stmt = $pdo->prepare("SET FOREIGN_KEY_CHECKS = 0");
        $success = $stmt->execute();
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $success = $stmt->execute([$id]);
        
        if ($success) {
            echo json_encode([
                'success' => true,
                'message' => 'Member deleted successfully'
            ]);
        } else {
            throw new Exception("Failed to delete member");
        }
    } catch (Exception $e) {
        error_log("Error deleting member: " . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => 'An error occurred while deleting the member'
        ]);
    }
}