// Initial member data
const members = [
    { id: 1, name: "Swami Chidananda", email: "chidananda@ashram.org", department: "Teacher", position: "Meditation, Yoga", hireDate: "2018-01-15", status: "active", image: "/public/person1.jpg" },
    { id: 2, name: "Mata Amrita", email: "amrita@ashram.org", department: "Teacher", position: "Bhakti, Kirtan", hireDate: "2016-08-20", status: "active", image: "/public/person2.jpg" },
    { id: 3, name: "Krishna Das", email: "krishna@ashram.org", department: "Staff", position: "Kitchen, Gardens", hireDate: "2020-05-10", status: "active", image: "/public/person3.jpg" },
    { id: 4, name: "Radha Devi", email: "radha@ashram.org", department: "Volunteer", position: "Reception, Tours", hireDate: "2019-11-05", status: "onleave", image: "/public/person4.jpg" },
    { id: 5, name: "Arjun Singh", email: "arjun@ashram.org", department: "Student", position: "Helping with Ceremonies", hireDate: "2022-03-18", status: "active", image: "/public/person1.jpg" },
    { id: 6, name: "Ganesha Patel", email: "ganesha@ashram.org", department: "Staff", position: "Maintenance, Technology", hireDate: "2021-06-23", status: "inactive", image: "/public/person2.jpg" },
    { id: 7, name: "Lakshmi Sharma", email: "lakshmi@ashram.org", department: "Volunteer", position: "Library, Teaching", hireDate: "2020-09-12", status: "active", image: "/public/person3.jpg" },
    { id: 8, name: "Rama Gupta", email: "rama@ashram.org", department: "Student", position: "Music, Events", hireDate: "2022-02-08", status: "active", image: "/public/person4.jpg" }
];

// Wait for the DOM to be fully loaded before accessing elements
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const memberGrid = document.getElementById('memberGrid');
    const roleFilter = document.getElementById('roleFilter');
    const statusFilter = document.getElementById('statusFilter');
    const memberSearch = document.getElementById('memberSearch');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const addMemberBtn = document.getElementById('addMemberBtn');
    const addMemberModal = document.getElementById('addMemberModal');
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const addMemberForm = document.getElementById('addMemberForm');
    
    // Stat cards
    const totalMembersCard = document.getElementById('totalMembersCard');
    const activeMembersCard = document.getElementById('activeMembersCard');
    const onRetreatCard = document.getElementById('onRetreatCard');
    const newThisMonthCard = document.getElementById('newThisMonthCard');
    
    // Helper function to close and reset the add member modal
    function closeAddMemberModal() {
        addMemberModal.classList.remove('show');
        addMemberModal.style.display = 'none';
        // Reset form and errors
        addMemberForm.reset();
        document.querySelectorAll('.error').forEach(err => err.style.display = 'none');
    }
    
    // Update stats function
    function updateStats() {
        const activeMembers = members.filter(member => member.status === 'active').length;
        const onRetreatMembers = members.filter(member => member.status === 'onleave').length;
        
        // Get current date to check for members added this month
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        // Calculate members added this month (assuming hireDate is when they joined)
        const newThisMonth = members.filter(member => {
            const hireDate = new Date(member.hireDate);
            return hireDate.getMonth() === currentMonth && hireDate.getFullYear() === currentYear;
        }).length;
        
        totalMembersCard.querySelector('.value').textContent = members.length;
        activeMembersCard.querySelector('.value').textContent = activeMembers;
        onRetreatCard.querySelector('.value').textContent = onRetreatMembers;
        newThisMonthCard.querySelector('.value').textContent = newThisMonth;
    }
    
    // Render Member Cards
    function renderMemberCards(filteredMembers) {
        memberGrid.innerHTML = '';
        
        filteredMembers.forEach(member => {
            let statusClass = '';
            if (member.status === 'active') statusClass = 'status-active';
            else if (member.status === 'inactive') statusClass = 'status-inactive';
            else if (member.status === 'onleave') statusClass = 'status-onleave';
            
            let statusText = member.status;
            if (statusText === 'onleave') statusText = 'On Retreat';
            else statusText = statusText.charAt(0).toUpperCase() + statusText.slice(1);
            
            const memberCard = document.createElement('div');
            memberCard.classList.add('member-card');
            memberCard.innerHTML = `
                <img src="${member.image}" alt="${member.name}">
                <h3>${member.name}</h3>
                <p>${member.department} | ${member.position}</p>
                <span class="status ${statusClass}">${statusText}</span>
            `;
            
            memberGrid.appendChild(memberCard);
        });
    }
    
    // Filter Members
    function filterMembers() {
        const roleValue = roleFilter.value;
        const statusValue = statusFilter.value;
        const searchValue = memberSearch.value.toLowerCase();
    
        const filteredMembers = members.filter(member => 
            (roleValue === '' || member.department === roleValue) &&
            (statusValue === '' || member.status === statusValue) &&
            (searchValue === '' || 
             member.name.toLowerCase().includes(searchValue) || 
             member.position.toLowerCase().includes(searchValue))
        );
    
        renderMemberCards(filteredMembers);
    }
    
    // Form validation
    function validateForm() {
        let isValid = true;
        const nameField = document.getElementById('memberName');
        const emailField = document.getElementById('memberEmail');
        const departmentField = document.getElementById('memberDepartment');
        const positionField = document.getElementById('memberPosition');
        
        // Reset previous errors
        document.querySelectorAll('.error').forEach(err => err.style.display = 'none');
        
        // Validate name
        if (!nameField.value.trim()) {
            document.getElementById('nameError').style.display = 'block';
            isValid = false;
        }
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailField.value)) {
            document.getElementById('emailError').style.display = 'block';
            isValid = false;
        }
        
        // Validate department
        if (!departmentField.value) {
            document.getElementById('departmentError').style.display = 'block';
            isValid = false;
        }
        
        // Validate position
        if (!positionField.value.trim()) {
            document.getElementById('positionError').style.display = 'block';
            isValid = false;
        }
        
        return isValid;
    }
    
    // Show notification
    function showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.backgroundColor = 'var(--vibrant-purple)';
        notification.style.color = 'white';
        notification.style.padding = '12px 20px';
        notification.style.borderRadius = '5px';
        notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        notification.style.zIndex = '1000';
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s ease';
        notification.innerHTML = `<i class="fas fa-check-circle" style="margin-right: 8px;"></i>${message}`;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // Add new member
    function addNewMember(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return false;
        }
        
        // Get form values
        const name = document.getElementById('memberName').value;
        const email = document.getElementById('memberEmail').value;
        const department = document.getElementById('memberDepartment').value;
        const position = document.getElementById('memberPosition').value;
        const status = document.getElementById('memberStatus').value;
        
        // Generate today's date for hireDate
        const today = new Date();
        const yyyy = today.getFullYear();
        let mm = today.getMonth() + 1; // Months start at 0
        let dd = today.getDate();
        
        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;
        
        const hireDate = yyyy + '-' + mm + '-' + dd;
        
        // Create new member object
        const newMember = {
            id: members.length + 1,
            name,
            email,
            department,
            position,
            hireDate,
            status,
            image: "/api/placeholder/150/150" // Default placeholder image
        };
        
        // Add to members array
        members.push(newMember);
        
        // Update the display
        updateStats();
        filterMembers();
        
        // Show success notification
        showNotification('Member added successfully!');
        
        // Close modal and reset form
        closeAddMemberModal();
        
        return false;
    }
    
    // Set up event listeners
    // Add Member button
    addMemberBtn.addEventListener('click', function() {
        // Force the modal to show with the correct styles
        addMemberModal.style.display = 'flex';
        addMemberModal.style.justifyContent = 'center';
        addMemberModal.style.alignItems = 'center';
        addMemberModal.classList.add('show');
    });
    
    // Close modal buttons
    closeModal.addEventListener('click', closeAddMemberModal);
    cancelBtn.addEventListener('click', closeAddMemberModal);
    
    // Click outside modal to close
    addMemberModal.addEventListener('click', function(e) {
        if (e.target === addMemberModal) {
            closeAddMemberModal();
        }
    });
    
    // Form submission
    addMemberForm.addEventListener('submit', addNewMember);
    
    // Filter event listeners
    roleFilter.addEventListener('change', filterMembers);
    statusFilter.addEventListener('change', filterMembers);
    memberSearch.addEventListener('input', filterMembers);
    
    // Sidebar Toggle for Mobile
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('open');
    });
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768 && 
            !sidebar.contains(e.target) && 
            !sidebarToggle.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    });
    
    // Initialize page
    updateStats();
    renderMemberCards(members);
});