<?php
// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check if user is logged in
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    // Redirect to login page
    header('Location: /prot/unauthorized.php');
    exit;
}

// Include database configuration
require_once __DIR__ . '/../api/config.php';

// Get user data
$userName = $_SESSION['user_name'] ?? 'User';
$userRole = $_SESSION['user_role'] ?? 'user';

// Only admin and employees can access this page
if ($userRole !== 'admin' && $userRole !== 'employee') {
    // Redirect to unauthorized page or home
    header('Location: unauthorized.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ashram Community Management Dashboard</title>
    <style>
:root {
    --dark: #07020d;      /* Deep black/purple */
    --light: #f6f1fd;     /* Light lavender */
    --primary: #732ddb;   /* Vibrant purple */
    --secondary: #eb8dc4; /* Pink */
    --accent: #e15270;    /* Coral/red */
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

body {
    background-color: var(--light);
    color: var(--dark);
    overflow-x: hidden;
}

.dashboard {
    display: grid;
    grid-template-columns: 250px 1fr;
    min-height: 100vh;
}

.sidebar {
    background-color: var(--dark);
    color: var(--light);
    padding: 20px;
    transition: transform 0.3s ease;
    z-index: 1000;
    position: relative;
}

.sidebar h1 {
    font-size: 1.5rem;
    margin-bottom: 30px;
    text-align: center;
    color: var(--light);
}

.sidebar ul {
    list-style: none;
}

.sidebar li {
    margin-bottom: 15px;
}

.sidebar a {
    color: var(--light);
    text-decoration: none;
    display: flex;
    align-items: center;
    padding: 10px;
    border-radius: 5px;
    transition: background-color 0.3s;
}

.sidebar a.active, .sidebar a:hover {
    background-color: var(--primary);
}

.sidebar i {
    margin-right: 10px;
}

.main-content {
    padding: 20px;
    overflow-x: hidden;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    flex-wrap: wrap;
    gap: 15px;
}

.search-bar {
    display: flex;
    align-items: center;
    background-color: white;
    border-radius: 5px;
    padding: 8px 15px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    width: 300px;
    border: 1px solid var(--primary);
    max-width: 100%;
}

.search-bar input {
    border: none;
    outline: none;
    padding: 5px;
    width: 100%;
}

.user-profile {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
}

.user-profile img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 2px solid var(--primary);
}

.card {
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 20px;
    margin-bottom: 20px;
    border-top: 4px solid var(--primary);
    overflow-x: auto;
}

.stat-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.stat-card {
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    background-color: white;
    border-left: 4px solid var(--primary);
}

.stat-card h3 {
    font-size: 1rem;
    color: var(--dark);
    margin-bottom: 10px;
}

.stat-card .value {
    font-size: 1.8rem;
    font-weight: bold;
    margin-bottom: 10px;
    color: var(--primary);
}

.stat-card .change {
    font-size: 0.9rem;
    display: flex;
    align-items: center;
}

.stat-card .positive {
    color: var(--primary);
}

.stat-card .negative {
    color: var(--accent);
}

.table-responsive {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
}

table {
    width: 100%;
    border-collapse: collapse;
    min-width: 600px;
}

table th, table td {
    padding: 15px;
    text-align: left;
    border-bottom: 1px solid #eee;
}

table th {
    background-color: rgba(115, 45, 219, 0.1);
    font-weight: 600;
    color: var(--primary);
}

.status {
    padding: 5px 10px;
    border-radius: 20px;
    font-size: 0.8rem;
    white-space: nowrap;
}

.status-active {
    background-color: rgba(115, 45, 219, 0.2);
    color: var(--primary);
}

.status-inactive {
    background-color: rgba(225, 82, 112, 0.2);
    color: var(--accent);
}

.status-onleave {
    background-color: rgba(235, 141, 196, 0.2);
    color: var(--secondary);
}

.action-btn {
    background-color: transparent;
    border: none;
    cursor: pointer;
    margin-right: 5px;
    font-size: 1rem;
    color: var(--dark);
}

.edit-btn:hover {
    color: var(--primary);
}

.delete-btn:hover {
    color: var(--accent);
}

.pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
    flex-wrap: wrap;
    gap: 5px;
}

.pagination button {
    background-color: white;
    border: 1px solid #ddd;
    padding: 8px 15px;
    cursor: pointer;
}

.pagination button.active {
    background-color: var(--primary);
    color: white;
    border-color: var(--primary);
}

.modal {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(7, 2, 13, 0.5);
    align-items: center;
    justify-content: center;
    overflow-y: auto;
}

.modal-content {
    background-color: white;
    border-radius: 10px;
    padding: 30px;
    width: 500px;
    max-width: 90%;
    border-top: 5px solid var(--primary);
    margin: 20px auto;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.close {
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--accent);
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
    color: var(--dark);
}

.form-group input, .form-group select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 1rem;
}

.form-group input:focus, .form-group select:focus {
    border-color: var(--primary);
    outline: none;
    box-shadow: 0 0 0 2px rgba(115, 45, 219, 0.2);
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    flex-wrap: wrap;
}

.btn {
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
}

.btn-primary {
    background-color: var(--primary);
    color: white;
}

.btn-secondary {
    background-color: var(--light);
    color: var(--dark);
    border: 1px solid var(--primary);
}

.attendance-chart, .performance-chart {
    height: 300px;
    margin-top: 20px;
    width: 100%;
}

.lotus-icon {
    display: inline-block;
    margin-right: 5px;
    color: var(--primary);
}

#alert-message {
    padding: 10px 15px;
    border-radius: 5px;
    margin-bottom: 20px;
    display: none;
}

.alert-success {
    background-color: rgba(115, 45, 219, 0.2);
    color: var(--primary);
    border: 1px solid var(--primary);
}

.alert-danger {
    background-color: rgba(225, 82, 112, 0.2);
    color: var(--accent);
    border: 1px solid var(--accent);
}

/* Mobile menu toggle button */
.menu-toggle {
    display: none;
    background: var(--primary);
    color: white;
    border: none;
    padding: 10px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1.2rem;
    position: fixed;
    top: 10px;
    left: 10px;
    z-index: 1001;
}

/* Responsive styles */
@media (max-width: 992px) {
    .stat-cards {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .dashboard {
        grid-template-columns: 200px 1fr;
    }
}

@media (max-width: 768px) {
    .dashboard {
        grid-template-columns: 1fr;
    }
    
    .menu-toggle {
        display: block;
    }
    
    .sidebar {
        position: fixed;
        left: 0;
        top: 0;
        height: 100vh;
        transform: translateX(-100%);
        transition: transform 0.3s ease;
    }
    
    .sidebar.active {
        transform: translateX(0);
    }
    
    .main-content {
        margin-left: 0;
        padding: 20px;
        padding-top: 60px;
    }
    
    .header {
        flex-direction: column;
        align-items: flex-start;
    }
    
    .search-bar {
        width: 100%;
        margin-bottom: 15px;
        order: 2;
    }
    
    .user-profile {
        width: 100%;
        justify-content: flex-start;
        order: 1;
    }
    
    .stat-cards {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 576px) {
    .card, .stat-card {
        padding: 15px;
    }
    
    .form-actions {
        justify-content: center;
    }
    
    .btn {
        padding: 8px 15px;
        font-size: 0.9rem;
    }
    
    .modal-content {
        padding: 20px;
    }
    
    table th, table td {
        padding: 10px;
        font-size: 0.9rem;
    }
}
    </style>
    <!-- Add Font Awesome for icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
<button class="menu-toggle" id="menuToggle">
    <i class="fas fa-bars"></i>
</button>


    <div class="dashboard">
        <div class="sidebar" id="sidebar">
            <h1>Ashram Management</h1>
            <ul>
                <li><a href="#" class="active"><i class="fas fa-om"></i> Dashboard</a></li>
                <li><a href="#" id="logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
            </ul>
        </div>
        
        <div class="main-content">
            <div class="header">
                <div>
                    <h1>Ashram Community Dashboard</h1>
                    <p>Namaste, <?php echo htmlspecialchars($userName); ?>! 🙏</p>
                </div>
                
                <div class="user-profile">
                    <div class="search-bar">
                        <i class="fas fa-search"></i>
                        <input type="text" id="search-input" placeholder="Search members...">
                    </div>
                    <img src="/public/person1.jpg" alt="Profile">
                    <span><?php echo htmlspecialchars($userName); ?></span>
                </div>
            </div>
            
            <div id="alert-message"></div>
            
            <div class="stat-cards">
                <div class="stat-card" id="total-members-card">
                    <h3>Total Members</h3>
                    <div class="value">-</div>
                    <div class="change positive">
                        <i class="fas fa-arrow-up"></i> <span>-</span>
                    </div>
                </div>
                
                <div class="stat-card" id="active-members-card">
                    <h3>Active Members</h3>
                    <div class="value">-</div>
                    <div class="change positive">
                        <i class="fas fa-arrow-up"></i> <span>-</span>
                    </div>
                </div>
                
                <div class="stat-card" id="inactive-members-card">
                    <h3>Inactive</h3>
                    <div class="value">-</div>
                    <div class="change negative">
                        <i class="fas fa-arrow-down"></i> <span>-</span>
                    </div>
                </div>
                
                <div class="stat-card" id="participation-card">
                    <h3>Avg. Participation</h3>
                    <div class="value">-</div>
                    <div class="change positive">
                        <i class="fas fa-arrow-up"></i> <span>-</span>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2>Member Directory</h2>
                    <button class="btn btn-primary" id="addMemberBtn">
                        <i class="fas fa-plus"></i> Add Member
                    </button>
                </div>
                
                <div class="table-responsive">
                    <table id="memberTable">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Role</th>
                                <th>Email</th>
                                <th>Join Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Table data will be populated by JavaScript -->
                        </tbody>
                    </table>
                </div>
                
                <div class="pagination" id="pagination">
                    <!-- Pagination will be populated by JavaScript -->
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px;">
                <div class="card">
                    <h2>Meditation Attendance</h2>
                    <div class="attendance-chart" >Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum</div>
                </div>
                
                <div class="card">
                    <h2>Spiritual Progress</h2>
                    <div class="performance-chart" >Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum</div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Add Member Modal -->
    <div class="modal" id="memberModal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 id="modalTitle">Add New Member</h2>
                <span class="close">&times;</span>
            </div>
            
            <form id="memberForm">
                <input type="hidden" id="memberId">
                
                <div class="form-group">
                    <label for="name">Full Name / Spiritual Name</label>
                    <input type="text" id="name" required>
                </div>
                
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" required>
                </div>
                
                <div class="form-group">
                    <label for="role">Role</label>
                    <select id="role" required>
                        <option value="">Select Role</option>
                        <option value="admin">Admin</option>
                        <option value="employee">Employee</option>
                        <option value="user">Member</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="password">Password (leave blank to keep current)</label>
                    <input type="password" id="password">
                </div>
                
                <div class="form-group">
                    <label for="status">Status</label>
                    <select id="status" required>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" id="cancelBtn">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save</button>
                </div>
            </form>
        </div>
    </div>
    
    <!-- Add Chart.js for charts -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.7.0/chart.min.js"></script>
    <!-- Add custom JavaScript -->
    <script src="/scripts/dashboard/dashboard.js" defer></script>
    <script>
        // Wait for DOM to be fully loaded
        document.addEventListener('DOMContentLoaded', function() {
            console.log("DOM fully loaded");
            
            // Get the menu toggle button and sidebar elements
            const menuToggle = document.getElementById('menuToggle');
            const sidebar = document.getElementById('sidebar');
            
            console.log("Menu toggle element:", menuToggle);
            console.log("Sidebar element:", sidebar);
            
            // Make sure both elements exist before adding event listeners
            if (menuToggle && sidebar) {
                // Add click event to toggle button
                menuToggle.addEventListener('click', function(e) {
                    console.log("Menu toggle clicked");
                    e.stopPropagation(); // Prevent the click from propagating
                    sidebar.classList.toggle('active');
                });
                
                // Add click event to document to close sidebar when clicking outside
                document.addEventListener('click', function(e) {
                    // If click is outside sidebar and not on toggle button
                    if (!sidebar.contains(e.target) && e.target !== menuToggle && !menuToggle.contains(e.target)) {
                        sidebar.classList.remove('active');
                    }
                });
                
                // Close sidebar when clicking a link inside it (for mobile)
                const sidebarLinks = sidebar.querySelectorAll('a');
                sidebarLinks.forEach(link => {
                    link.addEventListener('click', function() {
                        // Only close on mobile view
                        if (window.innerWidth <= 768) {
                            sidebar.classList.remove('active');
                        }
                    });
                });
            } else {
                console.error("Menu toggle or sidebar element not found!");
            }
        });
    </script>
</body>
</html>