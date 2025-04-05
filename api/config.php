<?php
/**
 * Database Configuration
 * 
 * This file contains the database connection parameters
 * loaded from the .env file.
 */

// Load environment variables using dotenv
require __DIR__ . '/../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

// Define database connection parameters
define('DB_HOST', 'localhost');
define('DB_NAME', 'webproj'); // Using 'test' as in your working example
define('DB_USER', $_ENV["DB_USER"]);
define('DB_PASS', $_ENV["DB_PASSWORD"]); // Note: using DB_PASSWORD instead of DB_PASS

// PDO connection options
define('DB_OPTIONS', [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
]);

/**
 * Get a new database connection
 * 
 * @return PDO Database connection
 */
function getDbConnection() {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    
    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, DB_OPTIONS);
        return $pdo;
    } catch (PDOException $e) {
        // For security, don't display detailed error information in production
        // Instead, log it and show a generic message
        $errorMsg = "Database Connection Error: " . $e->getMessage();
        
        // Log error with additional information
        error_log($errorMsg);
        
        // In development environment, you might want to see the actual error
        if ($_ENV['APP_ENV'] ?? '' === 'development') {
            throw new Exception($errorMsg);
        } else {
            throw new Exception("Database connection failed. Please contact the administrator.");
        }
    }
}