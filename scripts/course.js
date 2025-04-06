document.addEventListener('DOMContentLoaded', function() {
    // Initialize state variables
    let courses = [];
    let enrollments = [];
    let currentUser = null;
    let activeFilter = 'all';
    
    // DOM elements
    const coursesGrid = document.getElementById('courses-grid');
    const loadingElement = document.getElementById('loading');
    const notificationElement = document.getElementById('notification');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // Add event listeners to filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            // Set active filter
            activeFilter = this.dataset.filter;
            // Filter and render courses
            renderCourses();
        });
    });
    
    // Initialize - check authentication and fetch data
    init();
    
    // Main initialization function
    async function init() {
        try {
            // Check if user is authenticated
            await checkAuthentication();
            // Fetch courses and enrollments
            await fetchCourses();
            await fetchEnrollments();
            // Hide loading spinner
            loadingElement.style.display = 'none';
            // Render courses
            renderCourses();
        } catch (error) {
            console.error('Initialization error:', error);
            showNotification('Failed to load. Please refresh the page.', 'error');
            loadingElement.style.display = 'none';
        }
    }
    
    // Check if user is authenticated
    async function checkAuthentication() {
        try {
            const response = await fetch('/api/checkAuth.php');
            const data = await response.json();
            
            if (data.authenticated) {
                currentUser = data.user;
                console.log('Authenticated as:', currentUser);
            } else {
                console.log('Not authenticated');
            }
        } catch (error) {
            console.error('Authentication check failed:', error);
            throw new Error('Authentication check failed');
        }
    }
    
    // Fetch courses from API
    async function fetchCourses() {
        try {
            const response = await fetch('/api/coureg/getCourses.php');
            courses = await response.json();
            console.log('Courses loaded:', courses);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
            throw new Error('Failed to fetch courses');
        }
    }
    
    // Fetch course enrollments from API
    async function fetchEnrollments() {
        if (!currentUser) return; // Only fetch if user is logged in
        
        try {
            const response = await fetch(`/api/coureg/getEnrollments.php?user_id=${currentUser.id}`);
            enrollments = await response.json();
            console.log('Enrollments loaded:', enrollments);
        } catch (error) {
            console.error('Failed to fetch enrollments:', error);
            throw new Error('Failed to fetch enrollments');
        }
    }
    
    // Format date to display format
    function formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }
    
    // Format time from 24-hour to 12-hour format
    function formatTime(timeStr) {
        const [hours, minutes] = timeStr.split(':');
        let hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12 || 12;
        return `${hour}:${minutes} ${ampm}`;
    }
    
    // Get enrollment count for a course
    function getEnrollmentCount(courseId) {
        // In a real app, this would be fetched from the server
        // For demo purposes, we'll use a random number
        const course = courses.find(c => c.id == courseId);
        return Math.floor(Math.random() * course.capacity);
    }
    
    // Check if current user is enrolled in a course
    function isUserEnrolled(courseId) {
        if (!currentUser || !enrollments.length) return false;
        
        return enrollments.some(
            e => e.course_id == courseId && 
                e.status === 'active'
        );
    }
    
    // Format days array to readable format
    function formatDays(daysArray) {
        if (typeof daysArray === 'string') {
            try {
                daysArray = JSON.parse(daysArray);
            } catch (e) {
                console.error('Error parsing days:', e);
                return '';
            }
        }
        
        return daysArray.map(day => {
            return `<span class="days-badge">${day.substring(0, 3)}</span>`;
        }).join('');
    }
    
    // Render course cards
    function renderCourses() {
        // Clear current courses
        coursesGrid.innerHTML = '';
        
        if (!courses.length) {
            coursesGrid.innerHTML = '<p>No courses available.</p>';
            return;
        }
        
        // Filter courses based on active filter
        let filteredCourses = courses;
        
        if (activeFilter === 'available' && currentUser) {
            filteredCourses = courses.filter(course => !isUserEnrolled(course.id));
        } else if (activeFilter === 'enrolled' && currentUser) {
            filteredCourses = courses.filter(course => isUserEnrolled(course.id));
        }
        
        if (filteredCourses.length === 0) {
            coursesGrid.innerHTML = '<p>No courses match the selected filter.</p>';
            return;
        }
        
        // Create course cards
        filteredCourses.forEach(course => {
            const enrollmentCount = getEnrollmentCount(course.id);
            const isEnrolled = isUserEnrolled(course.id);
            const isFull = enrollmentCount >= course.capacity;
            const canRegister = currentUser && !isEnrolled && !isFull;
            
            // Try to parse days as JSON if it's a string
            let courseDays = course.days;
            
            const courseCard = `
                <div class="course-card">
                    <div class="course-header">
                        <h3 class="course-title">${course.name}</h3>
                        <div class="course-dates">
                            ${formatDate(course.start_date)} - ${formatDate(course.end_date)}
                        </div>
                    </div>
                    <div class="course-content">
                        <p class="course-description">${course.description}</p>
                        <div class="course-details">
                            <div class="detail-item">
                                <i>📍</i> ${course.location}
                            </div>
                            <div class="detail-item">
                                <i>⏰</i> ${formatTime(course.time)}
                            </div>
                            <div class="detail-item" style="grid-column: 1 / -1;">
                                <i>📆</i> ${formatDays(courseDays)}
                            </div>
                        </div>
                        <div class="enrollment-status">
                            <div class="capacity ${isFull ? 'capacity-full' : 'capacity-available'}">
                                ${enrollmentCount}/${course.capacity} enrolled
                            </div>
                            ${isEnrolled ? 
                                '<div class="enrolled-badge">Enrolled</div>' : 
                                `<button class="register-btn" 
                                    data-course-id="${course.id}" 
                                    ${!canRegister ? 'disabled' : ''}
                                    ${!currentUser ? 'title="Please log in to register"' : ''}
                                    ${isFull ? 'title="Course is full"' : ''}>
                                    Register
                                </button>`
                            }
                        </div>
                    </div>
                </div>
            `;
            
            coursesGrid.innerHTML += courseCard;
        });
        
        // Add event listeners to register buttons
        document.querySelectorAll('.register-btn').forEach(button => {
            button.addEventListener('click', function() {
                const courseId = this.dataset.courseId;
                registerForCourse(courseId);
            });
        });
    }
    
    // Register user for a course
    async function registerForCourse(courseId) {
        if (!currentUser) {
            showNotification('Please log in to register for courses.', 'error');
            return;
        }
        
        try {
            // Prepare form data
            const formData = new FormData();
            formData.append('user_id', currentUser.id);
            formData.append('course_id', courseId);
            
            // Send request to register
            const response = await fetch('/api/coureg/enrollCourse.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Update enrollments and re-render
                await fetchEnrollments();
                renderCourses();
                showNotification('Successfully enrolled in the course!', 'success');
            } else {
                showNotification(result.message || 'Failed to enroll in the course.', 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            showNotification('An error occurred. Please try again.', 'error');
        }
    }
    
    // Show notification message
    function showNotification(message, type) {
        notificationElement.textContent = message;
        notificationElement.className = `notification ${type}`;
        notificationElement.classList.add('show');
        
        // Hide after 3 seconds
        setTimeout(() => {
            notificationElement.classList.remove('show');
        }, 3000);
    }
});