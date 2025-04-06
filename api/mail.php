<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Log to a file for debugging
function debug_log($message) {
    error_log("[Newsletter Debug] " . $message);
    // Also write to a specific debug file if possible
    @file_put_contents(__DIR__ . '/newsletter_debug.log', date('[Y-m-d H:i:s] ') . $message . PHP_EOL, FILE_APPEND);
}

debug_log("API request received");

// Set headers to handle JSON requests and CORS if needed
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Consider restricting this in production
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Only process POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get the content from the request
$content = file_get_contents('php://input');
debug_log("Received input: " . $content);

// Try to decode JSON
$data = json_decode($content, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    debug_log("JSON decode error: " . json_last_error_msg());
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON: ' . json_last_error_msg()]);
    exit;
}

debug_log("Decoded data: " . print_r($data, true));

// Validate input
if (!isset($data['email']) || empty($data['email'])) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => 'Email is required']);
    exit;
}

$email = filter_var($data['email'], FILTER_VALIDATE_EMAIL);
if (!$email) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit;
}

// Log the subscription (optional)
error_log("New newsletter subscription: " . $email);

// Set up email content
$to = $email;
$subject = "Welcome to Our Newsletter!";
$message = "
<html>
<head>
    <title>Welcome to Our Newsletter</title>
</head>
<body>
    <div style='max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;'>
        <h1 style='color: #333;'>Thank You for Subscribing!</h1>
        <p>Dear Subscriber,</p>
        <p>Thank you for joining our newsletter. We're excited to share our latest updates and news with you.</p>
        <p>You'll receive our next newsletter soon.</p>
        <p>Best regards,</p>
        <p>The Team</p>
        <hr>
        <p style='font-size: 12px; color: #777;'>
            If you didn't subscribe to this newsletter, please ignore this email.
        </p>
    </div>
</body>
</html>
";

// Set headers for HTML email
$headers = "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
$headers .= "From: newsletter@yourdomain.com" . "\r\n";

debug_log("Attempting to send email to: " . $to);

// Check if mail function exists and is available
if (!function_exists('mail')) {
    debug_log("PHP mail function is not available");
    echo json_encode([
        'success' => false,
        'message' => 'Mail function is not available on this server'
    ]);
    exit;
}

// Try to send email
$mailSent = @mail($to, $subject, $message, $headers);

// Get any mail error message
$mailError = error_get_last();
if ($mailError && strpos($mailError['message'], 'mail') !== false) {
    debug_log("Mail error: " . $mailError['message']);
}

if ($mailSent) {
    debug_log("Mail sent successfully to: " . $email);
    // Return success response
    echo json_encode([
        'success' => true, 
        'message' => 'Thank you for subscribing! A welcome email has been sent to your inbox.'
    ]);
} else {
    // Log the error
    debug_log("Failed to send welcome email to: " . $email);
    
    // Return an error message
    echo json_encode([
        'success' => false, 
        'message' => 'Failed to send welcome email. Your subscription was received, but please contact support if you don\'t receive a welcome email.'
    ]);
}

debug_log("API request complete");
?>