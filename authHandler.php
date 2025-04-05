<?php
// Start session
session_start();

// Configure error reporting
error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't show errors to users

// Include database configuration
require_once 'config.php';

// Response helper function
function sendResponse($success, $message, $data = null) {
    $response = [
        'success' => $success,
        'message' => $message,
    ];
    
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    header('Content-Type: application/json');
    echo json_encode($response);
    exit;
}

// Connect to database
function connectDB() {
    try {
        return getDbConnection();
    } catch (Exception $e) {
        // Log the error but don't expose it to the user
        error_log("Database connection error: " . $e->getMessage());
        sendResponse(false, "Database connection error. Please try again later.");
    }
}

// Function to sanitize input
function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

// Function to validate email
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

// Function to validate password
function validatePassword($password) {
    // Min 8 characters, at least one number and one special character
    return (strlen($password) >= 8 && 
           preg_match('/[0-9]/', $password) && 
           preg_match('/[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]/', $password));
}

// Check if the request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, "Invalid request method");
}

// Get the request action
$action = isset($_POST['action']) ? $_POST['action'] : '';

// Handle different actions
switch ($action) {
    case 'login':
        handleLogin();
        break;
    case 'signup':
        handleSignup();
        break;
    case 'logout':
        handleLogout();
        break;
    default:
        sendResponse(false, "Invalid action");
}

// Handle login
function handleLogin() {
    // Check required fields
    if (!isset($_POST['email']) || !isset($_POST['password'])) {
        sendResponse(false, "Email and password are required");
    }
    
    // Sanitize input
    $email = sanitizeInput($_POST['email']);
    $password = $_POST['password']; // Don't sanitize password
    
    // Validate email
    if (!validateEmail($email)) {
        sendResponse(false, "Invalid email format");
    }
    
    try {
        $pdo = connectDB();
        
        // Prepare statement to get user by email
        $stmt = $pdo->prepare("SELECT id, name, email, password, status FROM users WHERE email = :email LIMIT 1");
        $stmt->bindParam(':email', $email, PDO::PARAM_STR);
        $stmt->execute();
        
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Check if user exists and verify password
        if ($user && password_verify($password, $user['password'])) {
            // Check user status
            if ($user['status'] !== 'active') {
                sendResponse(false, "Your account is not active. Please contact support.");
            }
            
            // Update last login
            $updateStmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = :id");
            $updateStmt->bindParam(':id', $user['id'], PDO::PARAM_INT);
            $updateStmt->execute();
            
            // Set session
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_name'] = $user['name'];
            $_SESSION['user_email'] = $user['email'];
            $_SESSION['logged_in'] = true;
            
            // Optional: Create a session record in the database for better security
            createUserSession($pdo, $user['id']);
            
            sendResponse(true, "Login successful", [
                'name' => $user['name'],
                'email' => $user['email'],
                'redirect' => 'index.php'
            ]);
        } else {
            sendResponse(false, "Invalid email or password");
        }
    } catch (PDOException $e) {
        error_log("Login error: " . $e->getMessage());
        sendResponse(false, "An error occurred during login. Please try again.");
    }
}

// Handle signup
function handleSignup() {
    // Check required fields
    if (!isset($_POST['name']) || !isset($_POST['email']) || !isset($_POST['password'])) {
        sendResponse(false, "All fields are required");
    }
    
    // Sanitize input
    $name = sanitizeInput($_POST['name']);
    $email = sanitizeInput($_POST['email']);
    $password = $_POST['password']; // Don't sanitize password
    
    // Validate inputs
    if (strlen($name) < 2) {
        sendResponse(false, "Name must be at least 2 characters");
    }
    
    if (!validateEmail($email)) {
        sendResponse(false, "Invalid email format");
    }
    
    if (!validatePassword($password)) {
        sendResponse(false, "Password must be at least 8 characters and include at least one number and one special character");
    }
    
    try {
        $pdo = connectDB();
        
        // Check if email already exists
        $checkStmt = $pdo->prepare("SELECT id FROM users WHERE email = :email LIMIT 1");
        $checkStmt->bindParam(':email', $email, PDO::PARAM_STR);
        $checkStmt->execute();
        
        if ($checkStmt->fetch()) {
            sendResponse(false, "Email already exists. Please use a different email or login.");
        }
        
        // Hash password
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        
        // Insert new user
        $insertStmt = $pdo->prepare("INSERT INTO users (name, email, password) VALUES (:name, :email, :password)");
        $insertStmt->bindParam(':name', $name, PDO::PARAM_STR);
        $insertStmt->bindParam(':email', $email, PDO::PARAM_STR);
        $insertStmt->bindParam(':password', $hashedPassword, PDO::PARAM_STR);
        $insertStmt->execute();
        
        // Get new user ID
        $userId = $pdo->lastInsertId();
        
        sendResponse(true, "Account created successfully", [
            'name' => $name,
            'email' => $email,
            'redirect' => 'login.php'
        ]);
    } catch (PDOException $e) {
        error_log("Signup error: " . $e->getMessage());
        sendResponse(false, "An error occurred during signup. Please try again.");
    }
}

// Handle logout
function handleLogout() {
    // Clear session
    $_SESSION = [];
    
    // Clear session cookie
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }
    
    // Destroy session
    session_destroy();
    
    sendResponse(true, "Logout successful", ['redirect' => 'login.php']);
}

// Create user session record
function createUserSession($pdo, $userId) {
    // Generate unique session ID
    $sessionId = bin2hex(random_bytes(32));
    
    // Set expiry time (e.g., 30 days from now)
    $expiresAt = date('Y-m-d H:i:s', strtotime('+30 days'));
    
    // Get IP and user agent
    $ipAddress = $_SERVER['REMOTE_ADDR'] ?? null;
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;
    
    try {
        $stmt = $pdo->prepare("INSERT INTO user_sessions (session_id, user_id, ip_address, user_agent, expires_at) 
                               VALUES (:session_id, :user_id, :ip_address, :user_agent, :expires_at)");
        
        $stmt->bindParam(':session_id', $sessionId, PDO::PARAM_STR);
        $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
        $stmt->bindParam(':ip_address', $ipAddress, PDO::PARAM_STR);
        $stmt->bindParam(':user_agent', $userAgent, PDO::PARAM_STR);
        $stmt->bindParam(':expires_at', $expiresAt, PDO::PARAM_STR);
        
        $stmt->execute();
        
        // Set session cookie
        $_SESSION['session_token'] = $sessionId;
        
        return true;
    } catch (PDOException $e) {
        error_log("Session creation error: " . $e->getMessage());
        return false;
    }
}