<?php
// api/booking.php - Handles room bookings and availability checks

// Include database connection
require_once __DIR__ . '/config.php';

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Set headers
header('Content-Type: application/json');

// Initialize response array
$response = [
    'success' => false,
    'message' => '',
    'data' => null
];

// Sanitize input
function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

// Validate date format (YYYY-MM-DD)
function validateDate($date) {
    $format = 'Y-m-d';
    $d = DateTime::createFromFormat($format, $date);
    return $d && $d->format($format) === $date;
}

// Handle GET request for checking availability
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'check_availability') {
    try {
        // Validate required parameters
        if (!isset($_GET['room_id']) || !isset($_GET['check_in']) || !isset($_GET['check_out'])) {
            $response['message'] = 'Missing required parameters';
            echo json_encode($response);
            exit;
        }
        
        // Sanitize inputs
        $roomId = sanitizeInput($_GET['room_id']);
        $checkIn = sanitizeInput($_GET['check_in']);
        $checkOut = sanitizeInput($_GET['check_out']);
        $numGuests = isset($_GET['guests']) ? (int)$_GET['guests'] : 1;
        
        // Validate dates
        if (!validateDate($checkIn) || !validateDate($checkOut)) {
            $response['message'] = 'Invalid date format';
            echo json_encode($response);
            exit;
        }
        
        // Check if check-out is after check-in
        if (strtotime($checkOut) <= strtotime($checkIn)) {
            $response['message'] = 'Check-out date must be after check-in date';
            echo json_encode($response);
            exit;
        }
        
        // Connect to database
        $pdo = getDbConnection();
        
        // Use the stored procedure to check availability
        $stmt = $pdo->prepare("CALL check_room_availability(?, ?, ?, ?)");
        $stmt->execute([$roomId, $checkIn, $checkOut, $numGuests]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $response['success'] = true;
        $response['data'] = [
            'available' => (bool)$result['available'],
            'message' => $result['message'],
            'available_space' => isset($result['available_space']) ? (int)$result['available_space'] : null
        ];
        
    } catch (Exception $e) {
        $response['message'] = 'Error: ' . $e->getMessage();
    }
    
    echo json_encode($response);
    exit;
}

// Handle POST request for creating a booking
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Decode the JSON input
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            // Try to get form data if JSON is not provided
            $input = $_POST;
        }
        
        // Validate required fields
        $requiredFields = ['room_id', 'check_in', 'check_out', 'full_name', 'email', 'phone', 'country', 'guests'];
        foreach ($requiredFields as $field) {
            if (!isset($input[$field]) || empty($input[$field])) {
                $response['message'] = "Missing required field: {$field}";
                echo json_encode($response);
                exit;
            }
        }
        
        // Sanitize inputs
        $roomId = sanitizeInput($input['room_id']);
        $checkIn = sanitizeInput($input['check_in']);
        $checkOut = sanitizeInput($input['check_out']);
        $fullName = sanitizeInput($input['full_name']);
        $email = sanitizeInput($input['email']);
        $phone = sanitizeInput($input['phone']);
        $country = sanitizeInput($input['country']);
        $numGuests = (int)$input['guests'];
        $specialRequests = isset($input['special_requests']) ? sanitizeInput($input['special_requests']) : null;
        
        // Validate email
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $response['message'] = 'Invalid email format';
            echo json_encode($response);
            exit;
        }
        
        // Validate dates
        if (!validateDate($checkIn) || !validateDate($checkOut)) {
            $response['message'] = 'Invalid date format';
            echo json_encode($response);
            exit;
        }
        
        // Check if check-out is after check-in
        if (strtotime($checkOut) <= strtotime($checkIn)) {
            $response['message'] = 'Check-out date must be after check-in date';
            echo json_encode($response);
            exit;
        }
        
        // Connect to database
        $pdo = getDbConnection();
        
        // Get user ID if logged in
        $userId = null;
        if (isset($_SESSION['user_id'])) {
            $userId = $_SESSION['user_id'];
        }
        
        try {
            // Start transaction
            $pdo->beginTransaction();
            
            // Insert the booking (the trigger will handle availability checking)
            $sql = "INSERT INTO bookings (
                        room_id, 
                        user_id, 
                        guest_name, 
                        email, 
                        phone, 
                        country, 
                        check_in_date, 
                        check_out_date, 
                        num_guests, 
                        special_requests, 
                        booking_status
                    ) VALUES (
                        :room_id, 
                        :user_id, 
                        :guest_name, 
                        :email, 
                        :phone, 
                        :country, 
                        :check_in_date, 
                        :check_out_date, 
                        :num_guests, 
                        :special_requests, 
                        'pending'
                    )";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':room_id' => $roomId,
                ':user_id' => $userId,
                ':guest_name' => $fullName,
                ':email' => $email,
                ':phone' => $phone,
                ':country' => $country,
                ':check_in_date' => $checkIn,
                ':check_out_date' => $checkOut,
                ':num_guests' => $numGuests,
                ':special_requests' => $specialRequests
            ]);
            
            $bookingId = $pdo->lastInsertId();
            
            // Commit transaction
            $pdo->commit();
            
            $response['success'] = true;
            $response['message'] = 'Booking created successfully';
            $response['data'] = ['booking_id' => $bookingId];
            
        } catch (PDOException $e) {
            // Roll back transaction
            $pdo->rollBack();
            
            // Check if this is from our custom trigger error
            if ($e->getCode() == '45000') {
                $response['message'] = $e->getMessage();
            } else {
                $response['message'] = 'Error creating booking: ' . $e->getMessage();
            }
        }
        
    } catch (Exception $e) {
        $response['message'] = 'Error: ' . $e->getMessage();
    }
    
    echo json_encode($response);
    exit;
}

// Handle GET request for listing user bookings
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'user_bookings') {
    try {
        // Check if user is logged in
        if (!isset($_SESSION['user_id'])) {
            $response['message'] = 'User not logged in';
            echo json_encode($response);
            exit;
        }
        
        $userId = $_SESSION['user_id'];
        
        // Connect to database
        $pdo = getDbConnection();
        
        // Get user bookings
        $sql = "SELECT b.*, r.title as room_title, r.price, r.currency, r.price_note 
                FROM bookings b 
                JOIN rooms r ON b.room_id = r.id 
                WHERE b.user_id = :user_id 
                ORDER BY b.check_in_date DESC";
                
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':user_id' => $userId]);
        
        $bookings = $stmt->fetchAll();
        
        $response['success'] = true;
        $response['data'] = $bookings;
        
    } catch (Exception $e) {
        $response['message'] = 'Error: ' . $e->getMessage();
    }
    
    echo json_encode($response);
    exit;
}

// If we get here, no valid action was requested
$response['message'] = 'Invalid request';
echo json_encode($response);