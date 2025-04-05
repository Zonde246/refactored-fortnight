<?php
// api/rooms.php - Returns all available rooms

// Include database connection
require_once __DIR__ . '/config.php';

// Set headers
header('Content-Type: application/json');

// Initialize response array
$response = [
    'success' => false,
    'message' => '',
    'data' => null
];

// Handle GET request to fetch all rooms
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Connect to database
        $pdo = getDbConnection();
        
        // Query to get all active rooms
        $sql = "SELECT 
                    id, 
                    title, 
                    description, 
                    features, 
                    price, 
                    currency, 
                    price_note AS priceNote, 
                    image, 
                    max_guests AS maxGuests 
                FROM rooms 
                WHERE active = 1 
                ORDER BY price ASC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        
        $rooms = $stmt->fetchAll();
        
        // Process the features from JSON to array
        foreach ($rooms as &$room) {
            if (isset($room['features']) && is_string($room['features'])) {
                $features = json_decode($room['features'], true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $room['features'] = $features;
                }
            }
        }
        
        $response['success'] = true;
        $response['data'] = $rooms;
        
    } catch (Exception $e) {
        $response['message'] = 'Error: ' . $e->getMessage();
    }
    
    echo json_encode($response);
    exit;
}

// Handle GET request to fetch a specific room
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id'])) {
    try {
        $roomId = $_GET['id'];
        
        // Connect to database
        $pdo = getDbConnection();
        
        // Query to get specific room
        $sql = "SELECT 
                    id, 
                    title, 
                    description, 
                    features, 
                    price, 
                    currency, 
                    price_note AS priceNote, 
                    image, 
                    max_guests AS maxGuests 
                FROM rooms 
                WHERE id = :id AND active = 1";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':id' => $roomId]);
        
        $room = $stmt->fetch();
        
        if (!$room) {
            $response['message'] = 'Room not found';
            echo json_encode($response);
            exit;
        }
        
        // Process the features from JSON to array
        if (isset($room['features']) && is_string($room['features'])) {
            $features = json_decode($room['features'], true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $room['features'] = $features;
            }
        }
        
        $response['success'] = true;
        $response['data'] = $room;
        
    } catch (Exception $e) {
        $response['message'] = 'Error: ' . $e->getMessage();
    }
    
    echo json_encode($response);
    exit;
}

// If we get here, no valid action was requested
$response['message'] = 'Invalid request method';
echo json_encode($response);