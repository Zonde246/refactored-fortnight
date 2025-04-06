# Shanti Ashram Web Application

This project is a web application for Shanti Ashram, providing features such as user authentication, room booking, course registration, and a dashboard for employees and administrators. The application is built using a combination of PHP, JavaScript, and HTML/CSS.

## Project Structure

### Root Files
- **`.env`**: Environment variables for sensitive data like database credentials.
- **`.gitignore`**: Specifies files and directories to be ignored by Git.
- **`.htaccess`**: Apache configuration file for URL rewriting and access control.
- **`about.html`**: Static page providing information about the ashram.
- **`authHandler.php`**: Handles user authentication (login, signup, logout).
- **`composer.json`**: Dependency manager configuration for PHP libraries.
- **`composer.lock`**: Lock file for PHP dependencies.
- **`config.php`**: Configuration file for database and application settings.
- **`contact.html`**: Static page with contact information and a form.
- **`err.php`**: Error page displayed for invalid or unauthorized access.
- **`index.html`**: Landing page for the application.
- **`login.html`**: Login and signup page with a card-flip animation.
- **`protection.php`**: Implements role-based access control for protected files.
- **`signup.php`**: PHP-based signup page.

### Directories
#### `.idea/`
Contains IDE-specific configuration files for PHPStorm or IntelliJ IDEA.

#### `api/`
- **`authHandler.php`**: API endpoint for user authentication.
- **`booking.php`**: API for handling room bookings.
- **`checkAuth.php`**: Verifies user authentication status.
- **`config.php`**: API-specific configuration file.
- **`Login.php`**: Handles login requests.
- **`logout.php`**: Handles user logout.
- **`mail.php`**: Sends emails for notifications or confirmations.
- **`mailHandler.php`**: Processes email-related requests.
- **`rooms.php`**: API for managing room data.
- **`user.php`**: API for user-related operations.
- **`coureg/`, `Dashboard/`, `employee/`, `summary/`**: Subdirectories for specific API modules.

#### `components/`
- **`navbar.js`**: Custom web component for the navigation bar.
- **`navbar.php`**: PHP-based navigation bar component.
- **`footer.js`**: Custom web component for the footer.
- **`footer.php`**: PHP-based footer component.

#### `prot/`
Contains protected pages and resources accessible only to authorized users.

#### `public/`
Publicly accessible assets such as images, fonts, and other static files.

#### `scripts/`
- **`Login.js`**: Handles login and signup form validation and submission.
- **`dashboard/dashauth.js`**: Manages authentication and user-specific data for the dashboard.
- **Other scripts**: Additional JavaScript files for various functionalities.

#### `styles/`
Contains CSS files for styling the application, including global styles and page-specific styles.

#### `vendor/`
Contains PHP dependencies installed via Composer.

## Key Features
- **Authentication**: Login, signup, and logout functionality.
- **Role-Based Access Control**: Restricts access to certain pages based on user roles.
- **Dynamic Components**: Custom navigation bar and footer implemented in both PHP and JavaScript.
- **Room Booking**: Allows users to book rooms at the ashram.
- **Course Registration**: Enables users to register for courses.
- **Dashboard**: Provides employees and administrators with tools to manage the ashram.

## Getting Started
1. Clone the repository.
2. Set up the `.env` file with your environment variables.
3. Install PHP dependencies using Composer:
   ```bash
   composer install
   ```
4. Start a local development server:
   - For PHP, you can use the built-in server:
     ```bash
     php -S localhost:8000
     ```
   - Alternatively, configure your Apache or Nginx server to point to the project directory.

5. Access the application in your browser at `http://localhost:8000`.

6. Set up the database:
   - Import the provided SQL file (`database.sql`) into your MySQL or MariaDB server.
   - Update the database credentials in the [.env](http://_vscodecontentref_/0) file.

7. Test the application:
   - Ensure all features like authentication, room booking, and course registration are working as expected.
