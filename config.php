<?php
/**
 * Database Configuration
 * 
 * This file contains the database connection parameters.
 * It should be included in any file that needs database access.
 * 
 * IMPORTANT: Update these values with your actual database credentials.
 * For security, consider moving this file outside the web root in a production environment.
 */

// Define database connection constants
define('DB_HOST', 'localhost');         // Database host
define('DB_NAME', 'your_database');     // Database name
define('DB_USER', 'your_username');     // Database username
define('DB_PASS', 'your_password');     // Database password
define('DB_CHARSET', 'utf8mb4');        // Character set

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
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    
    try {
        return new PDO($dsn, DB_USER, DB_PASS, DB_OPTIONS);
    } catch (PDOException $e) {
        // For security, don't display detailed error information in production
        // Instead, log it and show a generic message
        error_log("Database Connection Error: " . $e->getMessage());
        throw new Exception("Database connection failed. Please contact the administrator.");
    }
}