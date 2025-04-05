<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ashram Management - Employee Dashboard</title>
    <link rel="stylesheet" href="/styles/employee/styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <div class="container">
        <!-- Sidebar -->
        <div class="sidebar">
            <div class="logo">
                <h1>Ashram<span>Manager</span></h1>
            </div>
            
            <div class="nav-links">
                <div class="nav-item active" data-section="dashboard">
                    <i class="fas fa-tachometer-alt"></i>
                    <span>Dashboard</span>
                </div>
                <div class="nav-item" data-section="courses">
                    <i class="fas fa-book"></i>
                    <span>Courses</span>
                </div>
                <div class="nav-item" data-section="attendance">
                    <i class="fas fa-calendar-check"></i>
                    <span>Attendance</span>
                </div>
                <div class="nav-item" data-section="participants">
                    <i class="fas fa-users"></i>
                    <span>Participants</span>
                </div>
            </div>
            
            <div class="user-profile">
                <div class="profile-pic">
                    AM
                </div>
                <div class="user-info">
                    <p>Ananda Mukhopadhyay</p>
                    <p>Yoga Instructor</p>
                </div>
            </div>
        </div>
        
        <!-- Main Content -->
        <div class="main-content">
            <!-- Dashboard Section -->
            <div class="dashboard-section active" id="dashboard">
                <div class="header">
                    <h2 class="page-title">Dashboard</h2>
                    <div class="action-buttons">
                        <button class="btn btn-primary">
                            <i class="fas fa-download"></i> Export Report
                        </button>
                    </div>
                </div>
                
                <div class="stats-cards">
                    <div class="stat-card">
                        <div class="stat-title">Total Courses</div>
                        <div class="stat-value">12</div>
                        <div class="stat-trend trend-up">
                            <i class="fas fa-arrow-up"></i> 8% from last month
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-title">Active Participants</div>
                        <div class="stat-value">156</div>
                        <div class="stat-trend trend-up">
                            <i class="fas fa-arrow-up"></i> 12% from last month
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-title">Attendance Rate</div>
                        <div class="stat-value">89%</div>
                        <div class="stat-trend trend-down">
                            <i class="fas fa-arrow-down"></i> 3% from last month
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-title">New Enrollments</div>
                        <div class="stat-value">34</div>
                        <div class="stat-trend trend-up">
                            <i class="fas fa-arrow-up"></i> 15% from last month
                        </div>
                    </div>
                </div>
                
                <div class="header">
                    <h3 class="page-title">Upcoming Classes</h3>
                </div>
                
                <div class="course-list">
                    <div class="course-card">
                        <div class="course-header">
                            <h3>Advanced Meditation</h3>
                        </div>
                        <div class="course-body">
                            <div class="course-info">
                                <p><i class="fas fa-calendar"></i> Today, 8:00 AM</p>
                                <p><i class="fas fa-users"></i> 22 Participants</p>
                                <p><i class="fas fa-map-marker-alt"></i> Lotus Hall</p>
                            </div>
                            <div class="course-actions">
                                <button class="btn btn-primary"><i class="fas fa-calendar-check"></i> Take Attendance</button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="course-card">
                        <div class="course-header">
                            <h3>Hatha Yoga</h3>
                        </div>
                        <div class="course-body">
                            <div class="course-info">
                                <p><i class="fas fa-calendar"></i> Today, 10:30 AM</p>
                                <p><i class="fas fa-users"></i> 18 Participants</p>
                                <p><i class="fas fa-map-marker-alt"></i> Shanti Hall</p>
                            </div>
                            <div class="course-actions">
                                <button class="btn btn-primary"><i class="fas fa-calendar-check"></i> Take Attendance</button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="course-card">
                        <div class="course-header">
                            <h3>Bhakti Yoga</h3>
                        </div>
                        <div class="course-body">
                            <div class="course-info">
                                <p><i class="fas fa-calendar"></i> Today, 4:00 PM</p>
                                <p><i class="fas fa-users"></i> 15 Participants</p>
                                <p><i class="fas fa-map-marker-alt"></i> Ananda Hall</p>
                            </div>
                            <div class="course-actions">
                                <button class="btn btn-primary"><i class="fas fa-calendar-check"></i> Take Attendance</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Courses Section -->
            <div class="dashboard-section" id="courses">
                <div class="header">
                    <h2 class="page-title">Courses</h2>
                    <div class="action-buttons">
                        <button class="btn btn-primary" id="add-course-btn">
                            <i class="fas fa-plus"></i> Add New Course
                        </button>
                    </div>
                </div>
                
                <div class="course-list">
                    <!-- Course cards will be populated here by JS -->
                </div>
                
                <div class="pagination">
                    <button class="page-btn active">1</button>
                    <button class="page-btn">2</button>
                    <button class="page-btn">3</button>
                    <button class="page-btn">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
            
            <!-- Attendance Section -->
            <div class="dashboard-section" id="attendance">
                <div class="header">
                    <h2 class="page-title">Take Attendance</h2>
                </div>
                
                <div class="filter-options">
                    <select class="filter-select" id="course-select">
                        <option value="">Select Course</option>
                        <!-- Options will be populated by JS -->
                    </select>
                    
                    <input type="date" class="filter-select" id="date-select">
                </div>
                
                <div class="attendance-section">
                    <table>
                        <thead>
                            <tr>
                                <th>Participant</th>
                                <th>Email</th>
                                <th>Present</th>
                                <th>Notes</th>
                            </tr>
                        </thead>
                        <tbody id="attendance-tbody">
                            <!-- Will be populated by JS -->
                        </tbody>
                    </table>
                </div>
                
                <div style="margin-top: 20px; text-align: right;">
                    <button class="btn btn-primary" id="save-attendance-btn">Save Attendance</button>
                </div>
            </div>
            
            <!-- Participants Section -->
            <div class="dashboard-section" id="participants">
                <div class="header">
                    <h2 class="page-title">Participants</h2>
                    <div class="action-buttons">
                        <button class="btn btn-primary" id="add-participant-btn">
                            <i class="fas fa-plus"></i> Add Participant
                        </button>
                    </div>
                </div>
                
                <div class="search-bar">
                    <input type="text" placeholder="Search participants...">
                    <button class="btn btn-primary">
                        <i class="fas fa-search"></i>
                    </button>
                </div>
                
                <div class="filter-options">
                    <select class="filter-select">
                        <option value="">All Courses</option>
                        <!-- Options will be populated by JS -->
                    </select>
                    
                    <select class="filter-select">
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
                
                <table class="participants-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Courses</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="participants-tbody">
                        <!-- Will be populated by JS -->
                    </tbody>
                </table>
                
                <div class="pagination">
                    <button class="page-btn active">1</button>
                    <button class="page-btn">2</button>
                    <button class="page-btn">3</button>
                    <button class="page-btn">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Add Course Modal -->
    <div class="modal" id="course-modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Add New Course</h2>
                <button class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <form id="course-form">
                    <div class="form-group">
                        <label for="course-name">Course Name</label>
                        <input type="text" id="course-name" class="form-control" required>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="course-start">Start Date</label>
                            <input type="date" id="course-start" class="form-control" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="course-end">End Date</label>
                            <input type="date" id="course-end" class="form-control" required>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="course-days">Days</label>
                            <select id="course-days" class="form-control" multiple required>
                                <option value="mon">Monday</option>
                                <option value="tue">Tuesday</option>
                                <option value="wed">Wednesday</option>
                                <option value="thu">Thursday</option>
                                <option value="fri">Friday</option>
                                <option value="sat">Saturday</option>
                                <option value="sun">Sunday</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="course-time">Time</label>
                            <input type="time" id="course-time" class="form-control" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="course-location">Location</label>
                        <input type="text" id="course-location" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="course-capacity">Capacity</label>
                        <input type="number" id="course-capacity" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="course-description">Description</label>
                        <textarea id="course-description" class="form-control" rows="4"></textarea>
                    </div>
                    
                    <div style="text-align: right; margin-top: 20px;">
                        <button type="button" class="btn btn-secondary" id="cancel-course">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Course</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    
    <!-- Add Participant Modal -->
    <div class="modal" id="participant-modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Add New Participant</h2>
                <button class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <form id="participant-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="participant-fname">First Name</label>
                            <input type="text" id="participant-fname" class="form-control" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="participant-lname">Last Name</label>
                            <input type="text" id="participant-lname" class="form-control" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="participant-email">Email</label>
                        <input type="email" id="participant-email" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="participant-phone">Phone</label>
                        <input type="tel" id="participant-phone" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="participant-address">Address</label>
                        <textarea id="participant-address" class="form-control" rows="2"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="participant-courses">Enroll in Courses</label>
                        <select id="participant-courses" class="form-control" multiple>
                            <!-- Options will be populated by JS -->
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="participant-notes">Notes</label>
                        <textarea id="participant-notes" class="form-control" rows="3"></textarea>
                    </div>
                    
                    <div style="text-align: right; margin-top: 20px;">
                        <button type="button" class="btn btn-secondary" id="cancel-participant">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Participant</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    
    <script src="/scripts/employee/script.js"></script>
</body>
</html>