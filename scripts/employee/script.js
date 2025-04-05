// Dummy Data
const courses = [
    {
        id: 1,
        name: "Advanced Meditation",
        startDate: "2025-03-15",
        endDate: "2025-06-15",
        days: ["mon", "wed", "fri"],
        time: "08:00",
        location: "Lotus Hall",
        capacity: 30,
        enrolled: 22,
        description: "Deepening meditation practices for experienced practitioners"
    },
    {
        id: 2,
        name: "Hatha Yoga",
        startDate: "2025-03-01",
        endDate: "2025-05-30",
        days: ["tue", "thu", "sat"],
        time: "10:30",
        location: "Shanti Hall",
        capacity: 25,
        enrolled: 18,
        description: "Traditional hatha yoga focusing on alignment and breathing"
    },
    {
        id: 3,
        name: "Bhakti Yoga",
        startDate: "2025-03-10",
        endDate: "2025-06-10",
        days: ["mon", "thu"],
        time: "16:00",
        location: "Ananda Hall",
        capacity: 20,
        enrolled: 15,
        description: "Devotional practices, chanting and spiritual philosophy"
    },
    {
        id: 4,
        name: "Yoga Nidra",
        startDate: "2025-03-20",
        endDate: "2025-05-20",
        days: ["wed", "sun"],
        time: "19:00",
        location: "Peace Hall",
        capacity: 30,
        enrolled: 26,
        description: "Deep relaxation and meditation practice"
    },
    {
        id: 5,
        name: "Ayurvedic Cooking",
        startDate: "2025-04-01",
        endDate: "2025-05-15",
        days: ["sat"],
        time: "11:00",
        location: "Ashram Kitchen",
        capacity: 15,
        enrolled: 12,
        description: "Cooking classes based on ayurvedic principles"
    },
    {
        id: 6,
        name: "Sanskrit Studies",
        startDate: "2025-03-15",
        endDate: "2025-07-15",
        days: ["tue", "fri"],
        time: "17:30",
        location: "Study Room",
        capacity: 20,
        enrolled: 8,
        description: "Introduction to Sanskrit language and texts"
    }
];

// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Navigation
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.dashboard-section');
    
    // Course modal elements
    const addCourseBtn = document.getElementById('add-course-btn');
    const courseModal = document.getElementById('course-modal');
    const courseForm = document.getElementById('course-form');
    const cancelCourseBtn = document.getElementById('cancel-course');
    const closeCourseBtn = courseModal.querySelector('.close-btn');
    
    // Participant modal elements
    const addParticipantBtn = document.getElementById('add-participant-btn');
    const participantModal = document.getElementById('participant-modal');
    const participantForm = document.getElementById('participant-form');
    const cancelParticipantBtn = document.getElementById('cancel-participant');
    const closeParticipantBtn = participantModal.querySelector('.close-btn');
    
    // Attendance elements
    const courseSelect = document.getElementById('course-select');
    const dateSelect = document.getElementById('date-select');
    const attendanceTbody = document.getElementById('attendance-tbody');
    const saveAttendanceBtn = document.getElementById('save-attendance-btn');
    
    // Participants table
    const participantsTbody = document.getElementById('participants-tbody');
    
    // Course list container
    const courseListContainer = document.querySelector('#courses .course-list');
    
    // Initialize the page
    initializePage();
    
    // Navigation event listeners
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');
            
            // Update active navigation item
            navItems.forEach(navItem => navItem.classList.remove('active'));
            this.classList.add('active');
            
            // Show target section, hide others
            sections.forEach(section => {
                if (section.id === targetSection) {
                    section.classList.add('active');
                } else {
                    section.classList.remove('active');
                }
            });
        });
    });
    
    // Modal event listeners
    addCourseBtn.addEventListener('click', openCourseModal);
    cancelCourseBtn.addEventListener('click', closeCourseModal);
    closeCourseBtn.addEventListener('click', closeCourseModal);
    courseForm.addEventListener('submit', handleCourseSubmit);
    
    addParticipantBtn.addEventListener('click', openParticipantModal);
    cancelParticipantBtn.addEventListener('click', closeParticipantModal);
    closeParticipantBtn.addEventListener('click', closeParticipantModal);
    participantForm.addEventListener('submit', handleParticipantSubmit);
    
    // Attendance event listeners
    courseSelect.addEventListener('change', loadAttendanceData);
    dateSelect.addEventListener('change', loadAttendanceData);
    saveAttendanceBtn.addEventListener('click', saveAttendance);
    
    // Initialize the page
    function initializePage() {
        // Set current date for date selector
        const today = new Date().toISOString().split('T')[0];
        dateSelect.value = today;
        
        // Load courses into select dropdown
        populateCourseSelect();
        
        // Load course cards
        renderCourseCards();
        
        // Load participants
        renderParticipantsTable();
        
        // Populate participant course select
        populateParticipantCourseSelect();
    }
    
    // Course Functions
    function populateCourseSelect() {
        courseSelect.innerHTML = '<option value="">Select Course</option>';
        
        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.id;
            option.textContent = course.name;
            courseSelect.appendChild(option);
            
            // Also populate all other course selects
            document.querySelectorAll('.filter-select').forEach(select => {
                if (select !== courseSelect && select.id !== 'date-select') {
                    const optionClone = option.cloneNode(true);
                    select.appendChild(optionClone);
                }
            });
        });
    }
    
    function renderCourseCards() {
        courseListContainer.innerHTML = '';
        
        courses.forEach(course => {
            const card = document.createElement('div');
            card.className = 'course-card';
            
            // Format days
            const daysMap = {
                mon: 'Monday',
                tue: 'Tuesday',
                wed: 'Wednesday',
                thu: 'Thursday',
                fri: 'Friday',
                sat: 'Saturday',
                sun: 'Sunday'
            };
            
            const formattedDays = course.days.map(day => daysMap[day]).join(', ');
            
            // Format time
            const timeObj = new Date(`2025-01-01T${course.time}`);
            const formattedTime = timeObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            card.innerHTML = `
                <div class="course-header">
                    <h3>${course.name}</h3>
                </div>
                <div class="course-body">
                    <div class="course-info">
                        <p><i class="fas fa-calendar"></i> ${formattedDays} at ${formattedTime}</p>
                        <p><i class="fas fa-calendar-day"></i> ${course.startDate} to ${course.endDate}</p>
                        <p><i class="fas fa-users"></i> ${course.enrolled}/${course.capacity} Participants</p>
                        <p><i class="fas fa-map-marker-alt"></i> ${course.location}</p>
                        <p><i class="fas fa-info-circle"></i> ${course.description}</p>
                    </div>
                    <div class="course-actions">
                        <button class="btn btn-primary" onclick="takeAttendance(${course.id})"><i class="fas fa-calendar-check"></i> Attendance</button>
                        <button class="btn btn-secondary" onclick="editCourse(${course.id})"><i class="fas fa-edit"></i> Edit</button>
                    </div>
                </div>
            `;
            
            courseListContainer.appendChild(card);
        });
    }
    
    function openCourseModal() {
        courseModal.classList.add('show');
        courseForm.reset();
    }
    
    function closeCourseModal() {
        courseModal.classList.remove('show');
    }
    
    function handleCourseSubmit(e) {
        e.preventDefault();
        
        // Here you would normally send the data to the server
        // For now we'll just simulate adding a new course
        
        const newCourse = {
            id: courses.length + 1,
            name: document.getElementById('course-name').value,
            startDate: document.getElementById('course-start').value,
            endDate: document.getElementById('course-end').value,
            days: Array.from(document.getElementById('course-days').selectedOptions).map(option => option.value),
            time: document.getElementById('course-time').value,
            location: document.getElementById('course-location').value,
            capacity: parseInt(document.getElementById('course-capacity').value),
            enrolled: 0,
            description: document.getElementById('course-description').value
        };
        
        // Add course to array (in a real app, this would be a server call)
        courses.push(newCourse);
        
        // Re-render course cards
        renderCourseCards();
        
        // Update course selects
        populateCourseSelect();
        
        // Close modal
        closeCourseModal();
    }
    
    // Participant Functions
    function renderParticipantsTable() {
        participantsTbody.innerHTML = '';
        
        participants.forEach(participant => {
            const row = document.createElement('tr');
            
            // Get enrolled course names
            const enrolledCourses = participant.courses.map(courseId => {
                const course = courses.find(c => c.id === courseId);
                return course ? course.name : '';
            }).join(', ');
            
            row.innerHTML = `
                <td>${participant.firstName} ${participant.lastName}</td>
                <td>${participant.email}</td>
                <td>${participant.phone}</td>
                <td>${enrolledCourses}</td>
                <td><span class="status-badge ${participant.status}">${participant.status}</span></td>
                <td class="action-cell">
                    <button class="btn btn-secondary btn-sm" onclick="editParticipant(${participant.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-accent btn-sm" onclick="removeParticipant(${participant.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            participantsTbody.appendChild(row);
        });
    }
    
    function populateParticipantCourseSelect() {
        const participantCourses = document.getElementById('participant-courses');
        participantCourses.innerHTML = '';
        
        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.id;
            option.textContent = course.name;
            participantCourses.appendChild(option);
        });
    }
    
    function openParticipantModal() {
        participantModal.classList.add('show');
        participantForm.reset();
    }
    
    function closeParticipantModal() {
        participantModal.classList.remove('show');
    }
    
    function handleParticipantSubmit(e) {
        e.preventDefault();
        
        // Here you would normally send the data to the server
        // For now we'll just simulate adding a new participant
        
        const newParticipant = {
            id: participants.length + 1,
            firstName: document.getElementById('participant-fname').value,
            lastName: document.getElementById('participant-lname').value,
            email: document.getElementById('participant-email').value,
            phone: document.getElementById('participant-phone').value,
            address: document.getElementById('participant-address').value,
            courses: Array.from(document.getElementById('participant-courses').selectedOptions).map(option => parseInt(option.value)),
            status: 'active',
            joinDate: new Date().toISOString().split('T')[0]
        };
        
        // Add participant to array (in a real app, this would be a server call)
        participants.push(newParticipant);
        
        // Re-render participants table
        renderParticipantsTable();
        
        // Update course enrollment counts
        updateCourseEnrollments();
        
        // Close modal
        closeParticipantModal();
    }
    
    function updateCourseEnrollments() {
        // Reset all enrollments
        courses.forEach(course => {
            course.enrolled = 0;
        });
        
        // Count enrollments for each course
        participants.forEach(participant => {
            participant.courses.forEach(courseId => {
                const course = courses.find(c => c.id === courseId);
                if (course) {
                    course.enrolled++;
                }
            });
        });
        
        // Re-render course cards
        renderCourseCards();
    }
    
    // Attendance Functions
    function loadAttendanceData() {
        const courseId = courseSelect.value;
        const date = dateSelect.value;
        
        if (!courseId || !date) {
            attendanceTbody.innerHTML = '<tr><td colspan="4">Please select a course and date</td></tr>';
            return;
        }
        
        // Get participants for this course
        const courseParticipants = participants.filter(participant => 
            participant.courses.includes(parseInt(courseId))
        );
        
        // Check if we have attendance data for this date and course
        const dayAttendance = attendanceData[date] || {};
        const courseAttendance = dayAttendance[courseId] || [];
        
        // Clear the table
        attendanceTbody.innerHTML = '';
        
        // Populate the table
        courseParticipants.forEach(participant => {
            const row = document.createElement('tr');
            
            // Find attendance record if it exists
            const record = courseAttendance.find(record => record.participantId === participant.id);
            
            row.innerHTML = `
                <td>${participant.firstName} ${participant.lastName}</td>
                <td>${participant.email}</td>
                <td>
                    <input type="checkbox" class="attendance-checkbox" 
                           data-participant-id="${participant.id}"
                           ${record && record.present ? 'checked' : ''}>
                </td>
                <td>
                    <input type="text" class="form-control" 
                           data-participant-id="${participant.id}"
                           value="${record ? record.notes : ''}">
                </td>
            `;
            
            attendanceTbody.appendChild(row);
        });
    }
    
    function saveAttendance() {
        const courseId = courseSelect.value;
        const date = dateSelect.value;
        
        if (!courseId || !date) {
            alert('Please select a course and date');
            return;
        }
        
        // Prepare attendance data
        const checkboxes = document.querySelectorAll('.attendance-checkbox');
        const noteInputs = document.querySelectorAll('.form-control[data-participant-id]');
        
        // Initialize day if not exists
        if (!attendanceData[date]) {
            attendanceData[date] = {};
        }
        
        // Initialize course if not exists
        if (!attendanceData[date][courseId]) {
            attendanceData[date][courseId] = [];
        }
        
        // Clear existing records for this course and date
        attendanceData[date][courseId] = [];
        
        // Add new records
        checkboxes.forEach(checkbox => {
            const participantId = parseInt(checkbox.getAttribute('data-participant-id'));
            const noteInput = document.querySelector(`.form-control[data-participant-id="${participantId}"]`);
            
            attendanceData[date][courseId].push({
                participantId: participantId,
                present: checkbox.checked,
                notes: noteInput.value
            });
        });
        
        // In a real app, you would send this data to the server
        alert('Attendance saved successfully!');
    }
});

// Global functions for table row actions
function takeAttendance(courseId) {
    // Navigate to attendance tab
    document.querySelector('.nav-item[data-section="attendance"]').click();
    
    // Select the course
    document.getElementById('course-select').value = courseId;
    
    // Trigger change event to load attendance data
    const event = new Event('change');
    document.getElementById('course-select').dispatchEvent(event);
}

function editCourse(courseId) {
    // In a real app, you would fetch the course data and populate the form
    alert(`Editing course ${courseId}`);
}

function editParticipant(participantId) {
    // In a real app, you would fetch the participant data and populate the form
    alert(`Editing participant ${participantId}`);
}

function removeParticipant(participantId) {
    // In a real app, you would send a request to delete the participant
    if (confirm('Are you sure you want to delete this participant?')) {
        // Remove from array (in a real app, this would be a server call)
        const index = participants.findIndex(p => p.id === participantId);
        if (index !== -1) {
            participants.splice(index, 1);
            
            // Re-render participants table
            document.getElementById('participants-tbody').innerHTML = '';
            
            // Re-render everything - we need to call the function from inside the event listener
            document.dispatchEvent(new Event('DOMContentLoaded'));
        }
    }
}

// Dummy attendance data
const attendanceData = {
    "2025-03-27": {
        "1": [
            { participantId: 1, present: true, notes: "" },
            { participantId: 3, present: true, notes: "Arrived late" },
            { participantId: 5, present: false, notes: "Sick" },
            { participantId: 8, present: true, notes: "" }
        ],
        "3": [
            { participantId: 1, present: true, notes: "" },
            { participantId: 4, present: true, notes: "" },
            { participantId: 6, present: false, notes: "Family emergency" },
            { participantId: 8, present: true, notes: "" }
        ]
    },
    "2025-03-26": {
        "2": [
            { participantId: 2, present: true, notes: "" },
            { participantId: 4, present: true, notes: "" },
            { participantId: 7, present: true, notes: "" }
        ],
        "4": [
            { participantId: 3, present: true, notes: "" },
            { participantId: 6, present: true, notes: "" }
        ]
    }
};

// Dummy participants data
const participants = [
    {
        id: 1,
        firstName: "Ravi",
        lastName: "Patel",
        email: "ravi.patel@example.com",
        phone: "+91-9876543210",
        address: "43 Lotus Lane, Rishikesh",
        courses: [1, 3],
        status: "active",
        joinDate: "2025-01-10"
    },
    {
        id: 2,
        firstName: "Sophia",
        lastName: "Martinez",
        email: "sophia.m@example.com",
        phone: "+1-555-123-4567",
        address: "29 Banyan Road, Rishikesh",
        courses: [2, 5],
        status: "active",
        joinDate: "2025-02-05"
    },
    {
        id: 3,
        firstName: "Amit",
        lastName: "Sharma",
        email: "amit.sharma@example.com",
        phone: "+91-8765432109",
        address: "12 Peace Avenue, Rishikesh",
        courses: [1, 4, 6],
        status: "active",
        joinDate: "2025-01-15"
    },
    {
        id: 4,
        firstName: "Maya",
        lastName: "Johnson",
        email: "maya.j@example.com",
        phone: "+1-555-987-6543",
        address: "78 Ganga View, Rishikesh",
        courses: [2, 3],
        status: "active",
        joinDate: "2025-02-20"
    },
    {
        id: 5,
        firstName: "David",
        lastName: "Wang",
        email: "david.wang@example.com",
        phone: "+1-555-456-7890",
        address: "56 Mountain View, Rishikesh",
        courses: [1, 6],
        status: "inactive",
        joinDate: "2025-01-05"
    },
    {
        id: 6,
        firstName: "Priya",
        lastName: "Singh",
        email: "priya.singh@example.com",
        phone: "+91-7654321098",
        address: "34 Shanti Nagar, Rishikesh",
        courses: [3, 4],
        status: "active",
        joinDate: "2025-02-10"
    },
    {
        id: 7,
        firstName: "Michael",
        lastName: "Chen",
        email: "michael.c@example.com",
        phone: "+1-555-789-0123",
        address: "90 Ashram Road, Rishikesh",
        courses: [2, 5],
        status: "active",
        joinDate: "2025-01-20"
    },
    {
        id: 8,
        firstName: "Ananya",
        lastName: "Kumar",
        email: "ananya.k@example.com",
        phone: "+91-6543210987",
        address: "21 Divine Path, Rishikesh",
        courses: [1, 3, 5],
        status: "active",
        joinDate: "2025-02-15"
    }
];