document.addEventListener('DOMContentLoaded', function() {
    // Check user authentication
    checkAuthentication();
    
    // Initialize navigation
    initNavigation();
    
    // Initialize modals
    initModals();
    
    // Load dashboard data
    loadDashboardData();
    
    // Load courses
    loadCourses();
    
    // Initialize course form
    initCourseForm();
    
    // Initialize participant form
    initParticipantForm();
    
    // Initialize attendance section
    initAttendanceSection();
    
    // Initialize participants section
    initParticipantsSection();
});

// Global variables for pagination
const coursesPerPage = 6;
const participantsPerPage = 10;
let currentCoursePage = 1;
let currentParticipantPage = 1;
let totalCoursePages = 1;
let totalParticipantPages = 1;

// Authentication check
function checkAuthentication() {
    fetch('/api/checkAuth.php')
        .then(response => response.json())
        .then(data => {
            if (!data.authenticated) {
                // Redirect to login page if not authenticated
                window.location.href = '/login.html';
                return;
            }
            
            // Set user profile information
            const user = data.user;
            document.getElementById('profile-name').textContent = user.name;
            document.getElementById('profile-role').textContent = user.role;
            
            // Set initials for profile pic
            const nameParts = user.name.split(' ');
            let initials = '';
            if (nameParts.length >= 2) {
                initials = nameParts[0].charAt(0) + nameParts[1].charAt(0);
            } else {
                initials = nameParts[0].substr(0, 2);
            }
            document.getElementById('profile-initials').textContent = initials.toUpperCase();
        })
        .catch(error => {
            console.error('Authentication check failed:', error);
            alert('Failed to verify authentication. Please try again.');
        });
}

// Initialize navigation
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.dashboard-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');
            
            // Update active nav item
            navItems.forEach(item => item.classList.remove('active'));
            this.classList.add('active');
            
            // Update active section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) {
                    section.classList.add('active');
                }
            });
            
            // Load section data if needed
            if (targetSection === 'courses') {
                loadCourses();
            } else if (targetSection === 'participants') {
                loadParticipants();
            } else if (targetSection === 'attendance') {
                loadCourseOptions();
            }
        });
    });
}

// Initialize modals
function initModals() {
    const addCourseBtn = document.getElementById('add-course-btn');
    const addParticipantBtn = document.getElementById('add-participant-btn');
    const courseCancelBtn = document.getElementById('cancel-course');
    const participantCancelBtn = document.getElementById('cancel-participant');
    const closeBtns = document.querySelectorAll('.close-btn');
    
    addCourseBtn.addEventListener('click', function() {
        document.getElementById('course-modal-title').textContent = 'Add New Course';
        document.getElementById('course-form').reset();
        document.getElementById('course-id').value = '';
        document.getElementById('course-modal').classList.add('active');
    });
    
    addParticipantBtn.addEventListener('click', function() {
        document.getElementById('participant-modal-title').textContent = 'Add New Participant';
        document.getElementById('participant-form').reset();
        document.getElementById('participant-id').value = '';
        loadCourseOptionsForParticipant();
        document.getElementById('participant-modal').classList.add('active');
    });
    
    courseCancelBtn.addEventListener('click', function() {
        document.getElementById('course-modal').classList.remove('active');
    });
    
    participantCancelBtn.addEventListener('click', function() {
        document.getElementById('participant-modal').classList.remove('active');
    });
    
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').classList.remove('active');
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.classList.remove('active');
        }
    });
}

// Load dashboard data
function loadDashboardData() {
    // Show loading indicators
    document.getElementById('total-courses').textContent = '--';
    document.getElementById('total-participants').textContent = '--';
    document.getElementById('attendance-rate').textContent = '--';
    document.getElementById('new-enrollments').textContent = '--';
    
    // Fetch dashboard stats
    fetch('/api/employee/dashboard.php')
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                throw new Error(data.message || 'Failed to load dashboard data');
            }
            
            // Update statistics
            document.getElementById('total-courses').textContent = data.stats.totalCourses;
            document.getElementById('total-participants').textContent = data.stats.activeParticipants;
            document.getElementById('attendance-rate').textContent = data.stats.attendanceRate + '%';
            document.getElementById('new-enrollments').textContent = data.stats.newEnrollments;
            
            // Update trends
            document.getElementById('courses-trend').textContent = data.stats.coursesTrend + '% from last month';
            document.getElementById('participants-trend').textContent = data.stats.participantsTrend + '% from last month';
            document.getElementById('attendance-trend').textContent = data.stats.attendanceTrend + '% from last month';
            document.getElementById('enrollments-trend').textContent = data.stats.enrollmentsTrend + '% from last month';
            
            // Update trend icons and classes
            updateTrendDisplay('courses-trend', data.stats.coursesTrend);
            updateTrendDisplay('participants-trend', data.stats.participantsTrend);
            updateTrendDisplay('attendance-trend', data.stats.attendanceTrend);
            updateTrendDisplay('enrollments-trend', data.stats.enrollmentsTrend);
            
            // Load upcoming classes
            loadUpcomingClasses();
        })
        .catch(error => {
            console.error('Error loading dashboard data:', error);
            alert('Failed to load dashboard data: ' + error.message);
        });
}

// Update trend display
function updateTrendDisplay(elementId, trendValue) {
    const container = document.getElementById(elementId).parentElement;
    const icon = container.querySelector('i');
    
    if (trendValue >= 0) {
        container.classList.remove('trend-down');
        container.classList.add('trend-up');
        icon.classList.remove('fa-arrow-down');
        icon.classList.add('fa-arrow-up');
    } else {
        container.classList.remove('trend-up');
        container.classList.add('trend-down');
        icon.classList.remove('fa-arrow-up');
        icon.classList.add('fa-arrow-down');
    }
}

// Load upcoming classes
function loadUpcomingClasses() {
    const container = document.getElementById('upcoming-classes');
    container.innerHTML = '<div class="loading-spinner" id="upcoming-loader"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
    
    fetch('/api/employee/courses.php?upcoming=true')
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                throw new Error(data.message || 'Failed to load upcoming classes');
            }
            
            container.innerHTML = '';
            
            if (data.courses.length === 0) {
                container.innerHTML = '<p class="no-data">No upcoming classes found.</p>';
                return;
            }
            
            data.courses.forEach(course => {
                const courseCard = createCourseCard(course, true);
                container.appendChild(courseCard);
            });
        })
        .catch(error => {
            console.error('Error loading upcoming classes:', error);
            container.innerHTML = '<p class="error-message">Failed to load upcoming classes. Please try again.</p>';
        });
}

// Create course card
function createCourseCard(course, isUpcoming = false) {
    const card = document.createElement('div');
    card.classList.add('course-card');
    
    const header = document.createElement('div');
    header.classList.add('course-header');
    header.innerHTML = `<h3>${course.name}</h3>`;
    
    const body = document.createElement('div');
    body.classList.add('course-body');
    
    const info = document.createElement('div');
    info.classList.add('course-info');
    
    const dateStr = isUpcoming 
        ? `<p><i class="fas fa-calendar"></i> ${course.nextDate} ${course.time}</p>`
        : `<p><i class="fas fa-calendar"></i> ${course.startDate} to ${course.endDate}</p>
           <p><i class="fas fa-clock"></i> ${course.time} (${formatDays(course.days)})</p>`;
    
    info.innerHTML = dateStr + `
        <p><i class="fas fa-users"></i> ${course.enrolled}/${course.capacity} Participants</p>
        <p><i class="fas fa-map-marker-alt"></i> ${course.location}</p>
    `;
    
    const actions = document.createElement('div');
    actions.classList.add('course-actions');
    
    if (isUpcoming) {
        actions.innerHTML = `
            <button class="btn btn-primary" onclick="takeAttendance(${course.id}, '${course.nextDate}')">
                <i class="fas fa-calendar-check"></i> Take Attendance
            </button>
        `;
    } else {
        actions.innerHTML = `
            <button class="btn btn-primary" onclick="editCourse(${course.id})">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn btn-danger" onclick="deleteCourse(${course.id})">
                <i class="fas fa-trash"></i> Delete
            </button>
        `;
    }
    
    body.appendChild(info);
    body.appendChild(actions);
    
    card.appendChild(header);
    card.appendChild(body);
    
    return card;
}

// Format days array to string
function formatDays(daysArray) {
    const dayMap = {
        'mon': 'Monday',
        'tue': 'Tuesday',
        'wed': 'Wednesday',
        'thu': 'Thursday',
        'fri': 'Friday',
        'sat': 'Saturday',
        'sun': 'Sunday'
    };
    
    return daysArray.map(day => dayMap[day].substr(0, 3)).join(', ');
}

// Load all courses for the courses section
function loadCourses(page = 1) {
    currentCoursePage = page;
    
    const container = document.getElementById('all-courses');
    container.innerHTML = '<div class="loading-spinner" id="courses-loader"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
    
    fetch(`/api/employee/courses.php?page=${page}&limit=${coursesPerPage}`)
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                throw new Error(data.message || 'Failed to load courses');
            }
            
            container.innerHTML = '';
            
            if (data.courses.length === 0) {
                container.innerHTML = '<p class="no-data">No courses found.</p>';
                return;
            }
            
            data.courses.forEach(course => {
                const courseCard = createCourseCard(course);
                container.appendChild(courseCard);
            });
            
            // Update pagination
            totalCoursePages = Math.ceil(data.total / coursesPerPage);
            updatePagination('courses-pagination', totalCoursePages, currentCoursePage, loadCourses);
        })
        .catch(error => {
            console.error('Error loading courses:', error);
            container.innerHTML = '<p class="error-message">Failed to load courses. Please try again.</p>';
        });
}

// Initialize course form
function initCourseForm() {
    const form = document.getElementById('course-form');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const courseId = document.getElementById('course-id').value;
        const formData = {
            id: courseId || null,
            name: document.getElementById('course-name').value,
            startDate: document.getElementById('course-start').value,
            endDate: document.getElementById('course-end').value,
            days: Array.from(document.getElementById('course-days').selectedOptions).map(opt => opt.value),
            time: document.getElementById('course-time').value,
            location: document.getElementById('course-location').value,
            capacity: document.getElementById('course-capacity').value,
            description: document.getElementById('course-description').value
        };
        
        const url = '/api/employee/courses.php';
        const method = courseId ? 'PUT' : 'POST';
        
        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                throw new Error(data.message || 'Failed to save course');
            }
            
            // Close modal and reload courses
            document.getElementById('course-modal').classList.remove('active');
            loadCourses(currentCoursePage);
            
            // Reload course options for attendance and participants sections
            loadCourseOptions();
            loadCourseOptionsForParticipant();
            
            // Reload dashboard data if this is a new course
            if (!courseId) {
                loadDashboardData();
            }
        })
        .catch(error => {
            console.error('Error saving course:', error);
            alert('Failed to save course: ' + error.message);
        });
    });
}

// Edit course
function editCourse(courseId) {
    fetch(`/api/employee/courses.php?id=${courseId}`)
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                throw new Error(data.message || 'Failed to load course details');
            }
            
            const course = data.course;
            
            // Set form values
            document.getElementById('course-id').value = course.id;
            document.getElementById('course-name').value = course.name;
            document.getElementById('course-start').value = course.startDate;
            document.getElementById('course-end').value = course.endDate;
            document.getElementById('course-time').value = course.time;
            document.getElementById('course-location').value = course.location;
            document.getElementById('course-capacity').value = course.capacity;
            document.getElementById('course-description').value = course.description;
            
            // Set days multiselect
            const daysSelect = document.getElementById('course-days');
            for (let i = 0; i < daysSelect.options.length; i++) {
                daysSelect.options[i].selected = course.days.includes(daysSelect.options[i].value);
            }
            
            // Update modal title and show
            document.getElementById('course-modal-title').textContent = 'Edit Course';
            document.getElementById('course-modal').classList.add('active');
        })
        .catch(error => {
            console.error('Error loading course details:', error);
            alert('Failed to load course details: ' + error.message);
        });
}

// Delete course
function deleteCourse(courseId) {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
        return;
    }
    
    fetch(`/api/employee/courses.php?id=${courseId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            throw new Error(data.message || 'Failed to delete course');
        }
        
        // Reload courses
        loadCourses(currentCoursePage);
        
        // Reload dashboard data
        loadDashboardData();
        
        // Reload course options for attendance and participants sections
        loadCourseOptions();
        loadCourseOptionsForParticipant();
    })
    .catch(error => {
        console.error('Error deleting course:', error);
        alert('Failed to delete course: ' + error.message);
    });
}

// Initialize participants section
function initParticipantsSection() {
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('participant-search');
    const courseFilter = document.getElementById('participant-course-filter');
    const statusFilter = document.getElementById('participant-status-filter');
    
    // Search button click
    searchBtn.addEventListener('click', function() {
        loadParticipants(1);
    });
    
    // Enter key on search input
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            loadParticipants(1);
        }
    });
    
    // Course filter change
    courseFilter.addEventListener('change', function() {
        loadParticipants(1);
    });
    
    // Status filter change
    statusFilter.addEventListener('change', function() {
        loadParticipants(1);
    });
    
    // Load course options for filter
    loadCourseOptionsForFilter();
}

// Load participants
function loadParticipants(page = 1) {
    currentParticipantPage = page;
    
    const tbody = document.getElementById('participants-tbody');
    tbody.innerHTML = '<tr><td colspan="6" class="loading-cell"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';
    
    // Get filter values
    const searchQuery = document.getElementById('participant-search').value;
    const courseFilter = document.getElementById('participant-course-filter').value;
    const statusFilter = document.getElementById('participant-status-filter').value;
    
    // Build query string
    let queryParams = `page=${page}&limit=${participantsPerPage}`;
    if (searchQuery) queryParams += `&search=${encodeURIComponent(searchQuery)}`;
    if (courseFilter) queryParams += `&course=${courseFilter}`;
    if (statusFilter) queryParams += `&status=${statusFilter}`;
    
    fetch(`/api/employee/participants.php?${queryParams}`)
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                throw new Error(data.message || 'Failed to load participants');
            }
            
            tbody.innerHTML = '';
            
            if (data.participants.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="no-data">No participants found.</td></tr>';
                return;
            }
            
            data.participants.forEach(participant => {
                const row = document.createElement('tr');
                
                // Create courses badges
                const coursesBadges = participant.courses.map(course => 
                    `<span class="badge">${course}</span>`
                ).join(' ');
                
                // Create status badge
                const statusClass = participant.status === 'active' ? 'badge-success' : 'badge-secondary';
                const statusBadge = `<span class="badge ${statusClass}">${participant.status}</span>`;
                
                row.innerHTML = `
                    <td>${participant.firstName} ${participant.lastName}</td>
                    <td>${participant.email}</td>
                    <td>${participant.phone}</td>
                    <td>${coursesBadges}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="editParticipant(${participant.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteParticipant(${participant.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                
                tbody.appendChild(row);
            });
            
            // Update pagination
            totalParticipantPages = Math.ceil(data.total / participantsPerPage);
            updatePagination('participants-pagination', totalParticipantPages, currentParticipantPage, loadParticipants);
        })
        .catch(error => {
            console.error('Error loading participants:', error);
            tbody.innerHTML = '<tr><td colspan="6" class="error-message">Failed to load participants. Please try again.</td></tr>';
        });
}

// Initialize participant form
function initParticipantForm() {
    const form = document.getElementById('participant-form');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const participantId = document.getElementById('participant-id').value;
        const formData = {
            id: participantId || null,
            firstName: document.getElementById('participant-fname').value,
            lastName: document.getElementById('participant-lname').value,
            email: document.getElementById('participant-email').value,
            phone: document.getElementById('participant-phone').value,
            address: document.getElementById('participant-address').value,
            courses: Array.from(document.getElementById('participant-courses').selectedOptions).map(opt => opt.value),
            status: document.getElementById('participant-status').value,
            notes: document.getElementById('participant-notes').value
        };
        
        const url = '/api/employee/participants.php';
        const method = participantId ? 'PUT' : 'POST';
        
        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                throw new Error(data.message || 'Failed to save participant');
            }
            
            // Close modal and reload participants
            document.getElementById('participant-modal').classList.remove('active');
            loadParticipants(currentParticipantPage);
            
            // Reload dashboard data if this is a new participant
            if (!participantId) {
                loadDashboardData();
            }
        })
        .catch(error => {
            console.error('Error saving participant:', error);
            alert('Failed to save participant: ' + error.message);
        });
    });
}

// Edit participant
function editParticipant(participantId) {
    fetch(`/api/employee/participants.php?id=${participantId}`)
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                throw new Error(data.message || 'Failed to load participant details');
            }
            
            const participant = data.participant;
            
            // Set form values
            document.getElementById('participant-id').value = participant.id;
            document.getElementById('participant-fname').value = participant.firstName;
            document.getElementById('participant-lname').value = participant.lastName;
            document.getElementById('participant-email').value = participant.email;
            document.getElementById('participant-phone').value = participant.phone;
            document.getElementById('participant-address').value = participant.address;
            document.getElementById('participant-status').value = participant.status;
            document.getElementById('participant-notes').value = participant.notes;
            
            // Load course options and set selected courses
            loadCourseOptionsForParticipant(participant.courseIds);
            
            // Update modal title and show
            document.getElementById('participant-modal-title').textContent = 'Edit Participant';
            document.getElementById('participant-modal').classList.add('active');
        })
        .catch(error => {
            console.error('Error loading participant details:', error);
            alert('Failed to load participant details: ' + error.message);
        });
}

// Delete participant
function deleteParticipant(participantId) {
    if (!confirm('Are you sure you want to delete this participant? This action cannot be undone.')) {
        return;
    }
    
    fetch(`/api/employee/participants.php?id=${participantId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            throw new Error(data.message || 'Failed to delete participant');
        }
        
        // Reload participants
        loadParticipants(currentParticipantPage);
        
        // Reload dashboard data
        loadDashboardData();
    })
    .catch(error => {
        console.error('Error deleting participant:', error);
        alert('Failed to delete participant: ' + error.message);
    });
}

// Load course options for attendance section
function loadCourseOptions() {
    const select = document.getElementById('course-select');
    
    fetch('/api/employee/courses.php?active=true')
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                throw new Error(data.message || 'Failed to load courses');
            }
            
            // Clear existing options except the first one
            while (select.options.length > 1) {
                select.remove(1);
            }
            
            // Add course options
            data.courses.forEach(course => {
                const option = document.createElement('option');
                option.value = course.id;
                option.textContent = course.name;
                select.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error loading course options:', error);
            alert('Failed to load course options: ' + error.message);
        });
}

// Load course options for participant filter
function loadCourseOptionsForFilter() {
    const select = document.getElementById('participant-course-filter');
    
    fetch('/api/employee/courses.php?all=true')
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                throw new Error(data.message || 'Failed to load courses');
            }
            
            // Clear existing options except the first one
            while (select.options.length > 1) {
                select.remove(1);
            }
            
            // Add course options
            data.courses.forEach(course => {
                const option = document.createElement('option');
                option.value = course.id;
                option.textContent = course.name;
                select.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error loading course options:', error);
            alert('Failed to load course options: ' + error.message);
        });
}

// Load course options for participant form
function loadCourseOptionsForParticipant(selectedCourses = []) {
    const select = document.getElementById('participant-courses');
    
    fetch('/api/employee/courses.php?active=true')
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                throw new Error(data.message || 'Failed to load courses');
            }
            
            // Clear existing options
            select.innerHTML = '';
            
            // Add course options
            data.courses.forEach(course => {
                const option = document.createElement('option');
                option.value = course.id;
                option.textContent = course.name;
                option.selected = selectedCourses.includes(parseInt(course.id));
                select.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error loading course options:', error);
            alert('Failed to load course options: ' + error.message);
        });
}

// Initialize attendance section
function initAttendanceSection() {
    const courseSelect = document.getElementById('course-select');
    const dateSelect = document.getElementById('date-select');
    const saveBtn = document.getElementById('save-attendance-btn');
    
    // Set default date to today
    const today = new Date();
    dateSelect.value = today.toISOString().split('T')[0];
    
    // Course select change
    courseSelect.addEventListener('change', function() {
        if (this.value) {
            loadAttendanceList(this.value, dateSelect.value);
        } else {
            document.getElementById('attendance-tbody').innerHTML = '';
        }
    });
    
    // Date select change
    dateSelect.addEventListener('change', function() {
        if (courseSelect.value) {
            loadAttendanceList(courseSelect.value, this.value);
        }
    });
    
    // Save attendance button
    saveBtn.addEventListener('click', function() {
        saveAttendance();
    });
}

// Load attendance list
function loadAttendanceList(courseId, date) {
    const tbody = document.getElementById('attendance-tbody');
    tbody.innerHTML = '<tr><td colspan="4" class="loading-cell"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';
    
    fetch(`/api/employee/attendance.php?course=${courseId}&date=${date}`)
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                throw new Error(data.message || 'Failed to load attendance list');
            }
            
            tbody.innerHTML = '';
            
            if (data.participants.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" class="no-data">No participants enrolled in this course.</td></tr>';
                return;
            }
            
            data.participants.forEach(participant => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${participant.firstName} ${participant.lastName}</td>
                    <td>${participant.email}</td>
                    <td>
                        <input type="checkbox" class="attendance-checkbox" 
                               data-participant="${participant.id}" 
                               ${participant.present ? 'checked' : ''}>
                    </td>
                    <td>
                        <input type="text" class="form-control attendance-note" 
                               data-participant="${participant.id}" 
                               value="${participant.note || ''}">
                    </td>
                `;
                
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error loading attendance list:', error);
            tbody.innerHTML = '<tr><td colspan="4" class="error-message">Failed to load attendance list. Please try again.</td></tr>';
        });
}

// Save attendance
function saveAttendance() {
    const courseId = document.getElementById('course-select').value;
    const date = document.getElementById('date-select').value;
    
    if (!courseId) {
        alert('Please select a course');
        return;
    }
    
    if (!date) {
        alert('Please select a date');
        return;
    }
    
    const checkboxes = document.querySelectorAll('.attendance-checkbox');
    const notes = document.querySelectorAll('.attendance-note');
    
    if (checkboxes.length === 0) {
        alert('No participants to record attendance for');
        return;
    }
    
    const attendanceData = {
        courseId: courseId,
        date: date,
        attendance: []
    };
    
    checkboxes.forEach((checkbox, index) => {
        attendanceData.attendance.push({
            participantId: checkbox.getAttribute('data-participant'),
            present: checkbox.checked,
            note: notes[index].value
        });
    });
    
    fetch('/api/employee/attendance.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(attendanceData)
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            throw new Error(data.message || 'Failed to save attendance');
        }
        
        alert('Attendance saved successfully');
        
        // Reload dashboard data
        loadDashboardData();
    })
    .catch(error => {
        console.error('Error saving attendance:', error);
        alert('Failed to save attendance: ' + error.message);
    });
}

// Take attendance for upcoming class
function takeAttendance(courseId, date) {
    // Navigate to attendance tab
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-section') === 'attendance') {
            item.classList.add('active');
        }
    });
    
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
        if (section.id === 'attendance') {
            section.classList.add('active');
        }
    });
    
    // Set the course and date
    document.getElementById('course-select').value = courseId;
    document.getElementById('date-select').value = date;
    
    // Load attendance list
    loadAttendanceList(courseId, date);
}

// Update pagination
function updatePagination(containerId, totalPages, currentPage, callback) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    if (totalPages <= 1) {
        return;
    }
    
    // Previous button
    if (currentPage > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.classList.add('page-btn');
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.addEventListener('click', () => callback(currentPage - 1));
        container.appendChild(prevBtn);
    }
    
    // Page buttons
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.classList.add('page-btn');
        if (i === currentPage) {
            pageBtn.classList.add('active');
        }
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => callback(i));
        container.appendChild(pageBtn);
    }
    
    // Next button
    if (currentPage < totalPages) {
        const nextBtn = document.createElement('button');
        nextBtn.classList.add('page-btn');
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.addEventListener('click', () => callback(currentPage + 1));
        container.appendChild(nextBtn);
    }
}