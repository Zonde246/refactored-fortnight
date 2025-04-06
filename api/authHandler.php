<?php
// Start session
session_start();

// Configure error reporting (set to 1 for debugging, 0 for production)
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Include database configuration
require_once __DIR__ . '/config.php';

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

// Connect to database - Updated to use direct connection like your working example
function connectDB() {
    try {
        $url = DB_HOST;
        $username = DB_USER;
        $password = DB_PASS;
        $dbname = DB_NAME;
        
        $conn = new PDO("mysql:host=$url;dbname=$dbname", $username, $password);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $conn;
    } catch (PDOException $e) {
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
        
        // Updated query to include role
        $stmt = $pdo->prepare("SELECT id, name, email, password, role, status FROM users WHERE email = :email LIMIT 1");
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
            
            // Set session with role information
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_name'] = $user['name'];
            $_SESSION['user_email'] = $user['email'];
            $_SESSION['user_role'] = $user['role'];
            $_SESSION['logged_in'] = true;
            
            // Optional: Create a session record in the database for better security
            createUserSession($pdo, $user['id']);
            
            // If user is employee, get additional staff information
            $staffInfo = null;
            if ($user['role'] === 'employee') {
                $staffStmt = $pdo->prepare("SELECT * FROM staff WHERE user_id = :user_id");
                $staffStmt->bindParam(':user_id', $user['id'], PDO::PARAM_INT);
                $staffStmt->execute();
                $staffInfo = $staffStmt->fetch(PDO::FETCH_ASSOC);
                
                if ($staffInfo) {
                    $_SESSION['staff_info'] = $staffInfo;
                }
            }
            
            sendResponse(true, "Login successful", [
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role'],
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
    // Get input data and validate
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    
    // Validate required fields
    if (empty($name)) {
        sendResponse(false, "Name is required");
    }
    
    if (empty($email)) {
        sendResponse(false, "Email is required");
    }
    
    if (empty($password)) {
        sendResponse(false, "Password is required");
    }
    
    // Email format validation
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendResponse(false, "Invalid email format");
    }
    
    // Password validation - matching the frontend requirements
    if (strlen($password) < 8) {
        sendResponse(false, "Password must be at least 8 characters long");
    }
    
    if (!preg_match('/[0-9]/', $password)) {
        sendResponse(false, "Password must include at least one number");
    }
    
    if (!preg_match('/[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]/', $password)) {
        sendResponse(false, "Password must include at least one special character");
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
        
        // Updated query to explicitly set role as 'user'
        $insertStmt = $pdo->prepare("INSERT INTO users (name, email, password, role) VALUES (:name, :email, :password, 'user')");
        $insertStmt->bindParam(':name', $name, PDO::PARAM_STR);
        $insertStmt->bindParam(':email', $email, PDO::PARAM_STR);
        $insertStmt->bindParam(':password', $hashedPassword, PDO::PARAM_STR);
        $insertStmt->execute();
        
        // Get new user ID
        $userId = $pdo->lastInsertId();
        
        sendResponse(true, "Account created successfully", [
            'name' => $name,
            'email' => $email,
            'role' => 'user'
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
    
    sendResponse(true, "Logout successful", ['redirect' => '/index.html']);
}

function getUserRole() {
    if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true && isset($_SESSION['user_role'])) {
        return $_SESSION['user_role'];
    }
    return null;
}

function isLoggedIn() {
    return isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true;
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