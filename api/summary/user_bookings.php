<?php
// api/user_bookings.php
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
    
    // Query to get bookings using the actual schema you provided
    $stmt = $pdo->prepare("
        SELECT b.*, r.title as room_title, r.currency, r.price, 
               DATEDIFF(b.check_out_date, b.check_in_date) as nights,
               (DATEDIFF(b.check_out_date, b.check_in_date) * r.price) as total_price
        FROM bookings b
        JOIN rooms r ON b.room_id = r.id
        WHERE b.user_id = :user_id
        ORDER BY b.check_in_date DESC
    ");
    
    $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
    $stmt->execute();
    
    $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'bookings' => $bookings
    ]);
    
} catch (PDOException $e) {
    // Log error (but don't expose details to client)
    error_log("Database error in user_bookings.php: " . $e->getMessage());
    
    echo json_encode([
        'success' => false,
        'message' => 'Error retrieving booking data'
    ]);
}
?>