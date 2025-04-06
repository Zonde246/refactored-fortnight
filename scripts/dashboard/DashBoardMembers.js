/**
 * Ashram Community Members Dashboard JavaScript
 * Connects to the members API for CRUD operations
 */

// DOM Elements
const memberGrid = document.getElementById('memberGrid');
const memberSearch = document.getElementById('memberSearch');
const roleFilter = document.getElementById('roleFilter');
const statusFilter = document.getElementById('statusFilter');
const addMemberBtn = document.getElementById('addMemberBtn');
const addMemberModal = document.getElementById('addMemberModal');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const addMemberForm = document.getElementById('addMemberForm');

// Stats Elements
const totalMembersCard = document.getElementById('totalMembersCard');
const activeMembersCard = document.getElementById('activeMembersCard');
const onRetreatCard = document.getElementById('onRetreatCard');
const newThisMonthCard = document.getElementById('newThisMonthCard');

// Sidebar Toggle for mobile
const sidebarToggle = document.querySelector('.sidebar-toggle');
const dashboard = document.querySelector('.dashboard');

// Global Variables
let currentPage = 1;
let currentFilters = {
    search: '',
    department: '',
    status: ''
};

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Load initial data
    loadMemberStats();
    loadMembers();
    
    // Set up event listeners
    setupEventListeners();
    
    // Set up form validation
    setupFormValidation();
});

/**
 * Load member statistics from API
 */
function loadMemberStats() {
    fetch('/api/members.php?stats=true')
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                throw new Error(data.message || 'Failed to load member statistics');
            }
            
            // Update stats cards
            totalMembersCard.querySelector('.value').textContent = data.stats.totalMembers;
            activeMembersCard.querySelector('.value').textContent = data.stats.activeMembers;
            onRetreatCard.querySelector('.value').textContent = data.stats.onRetreatMembers;
            newThisMonthCard.querySelector('.value').textContent = data.stats.newThisMonth;
        })
        .catch(error => {
            console.error('Error loading member statistics:', error);
            showNotification('Error loading statistics. Please try again.', 'error');
        });
}

/**
 * Load members from API with filters
 */
function loadMembers() {
    // Show loading state
    memberGrid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading members...</div>';
    
    // Build query parameters
    const params = new URLSearchParams();
    params.append('page', currentPage);
    params.append('limit', 12); // Show 12 members per page
    
    if (currentFilters.search) {
        params.append('search', currentFilters.search);
    }
    
    if (currentFilters.department) {
        params.append('department', currentFilters.department);
    }
    
    if (currentFilters.status) {
        params.append('status', currentFilters.status);
    }
    
    fetch(`/api/members.php?${params.toString()}`)
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                throw new Error(data.message || 'Failed to load members');
            }
            
            // Clear the grid
            memberGrid.innerHTML = '';
            
            if (data.members.length === 0) {
                memberGrid.innerHTML = '<div class="no-results">No members found matching your criteria. Try adjusting your filters.</div>';
                return;
            }
            
            // Create member cards
            data.members.forEach(member => {
                const memberCard = createMemberCard(member);
                memberGrid.appendChild(memberCard);
            });
            
            // Update stats after filtering
            loadMemberStats();
        })
        .catch(error => {
            console.error('Error loading members:', error);
            memberGrid.innerHTML = '<div class="error">Error loading members. Please try again.</div>';
        });
}

/**
 * Create a member card HTML element
 * @param {Object} member - Member data object
 * @returns {HTMLElement} - The member card element
 */
function createMemberCard(member) {
    const card = document.createElement('div');
    card.className = 'member-card';
    
    // Create status class based on member status
    let statusClass = 'status-active';
    if (member.status === 'inactive') {
        statusClass = 'status-inactive';
    } else if (member.status === 'onleave') {
        statusClass = 'status-onleave';
    }
    
    // Format status text
    let statusText = member.status;
    if (statusText === 'onleave') {
        statusText = 'On Retreat';
    } else {
        statusText = capitalizeFirstLetter(statusText);
    }
    
    // Calculate first letter of name for avatar
    const nameParts = member.name.split(' ');
    const initials = nameParts.map(part => part.charAt(0)).join('').toUpperCase();
    
    // Format date
    const hireDate = new Date(member.hireDate);
    const formattedDate = hireDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
    
    card.innerHTML = `
        <div class="member-avatar">
            <span>${initials}</span>
        </div>
        <div class="member-info">
            <h3>${member.name}</h3>
            <p class="member-role">${member.department}</p>
            <p class="member-position">${member.position}</p>
            <p class="member-date">Joined: ${formattedDate}</p>
            <div class="member-status ${statusClass}">${statusText}</div>
        </div>
        <div class="member-actions">
            <button class="action-btn edit-btn" data-id="${member.id}">
                <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn delete-btn" data-id="${member.id}">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    // Add event listeners to action buttons
    const editBtn = card.querySelector('.edit-btn');
    editBtn.addEventListener('click', () => openEditModal(member.id));
    
    const deleteBtn = card.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => confirmDeleteMember(member.id, member.name));
    
    return card;
}

/**
 * Capitalize the first letter of a string
 * @param {string} string - The input string
 * @returns {string} - The string with first letter capitalized
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
    // Search input
    memberSearch.addEventListener('input', debounce(function() {
        currentFilters.search = memberSearch.value.trim();
        currentPage = 1;
        loadMembers();
    }, 300));
    
    // Role filter
    roleFilter.addEventListener('change', function() {
        currentFilters.department = roleFilter.value;
        currentPage = 1;
        loadMembers();
    });
    
    // Status filter
    statusFilter.addEventListener('change', function() {
        currentFilters.status = statusFilter.value;
        currentPage = 1;
        loadMembers();
    });
    
    // Add member button
    addMemberBtn.addEventListener('click', openAddModal);
    
    // Close modal buttons
    closeModal.addEventListener('click', closeAddModal);
    cancelBtn.addEventListener('click', closeAddModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === addMemberModal) {
            closeAddModal();
        }
    });
    
    // Form submission
    addMemberForm.addEventListener('submit', handleFormSubmit);
    
    // Sidebar toggle for mobile
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            dashboard.classList.toggle('sidebar-open');
        });
    }
}

/**
 * Open the modal in add mode
 */
function openAddModal() {
    addMemberForm.reset();
    addMemberForm.dataset.mode = 'add';
    addMemberForm.dataset.memberId = '';
    document.querySelector('.modal-header h2').innerHTML = '<i class="fas fa-user-plus"></i> Add New Member';
    
    // Hide all error messages
    document.querySelectorAll('.error').forEach(el => el.style.display = 'none');
    
    addMemberModal.style.display = 'block';
}

/**
 * Open the modal in edit mode
 * @param {number} memberId - The ID of the member to edit
 */
function openEditModal(memberId) {
    fetch(`/api/members.php?id=${memberId}`)
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                throw new Error(data.message || 'Failed to load member details');
            }
            
            const member = data.member;
            
            // Set form values
            document.getElementById('memberName').value = member.name;
            document.getElementById('memberEmail').value = member.email;
            document.getElementById('memberDepartment').value = member.department;
            document.getElementById('memberPosition').value = member.position;
            document.getElementById('memberStatus').value = member.status;
            
            // Set form mode and member ID
            addMemberForm.dataset.mode = 'edit';
            addMemberForm.dataset.memberId = member.id;
            
            // Update modal title
            document.querySelector('.modal-header h2').innerHTML = '<i class="fas fa-user-edit"></i> Edit Member';
            
            // Hide all error messages
            document.querySelectorAll('.error').forEach(el => el.style.display = 'none');
            
            // Show the modal
            addMemberModal.style.display = 'block';
        })
        .catch(error => {
            console.error('Error loading member details:', error);
            showNotification('Error loading member details. Please try again.', 'error');
        });
}

/**
 * Close the add/edit member modal
 */
function closeAddModal() {
    addMemberModal.style.display = 'none';
    addMemberForm.reset();
}

/**
 * Handle form submission (add or edit member)
 * @param {Event} event - The form submit event
 */
function handleFormSubmit(event) {
    event.preventDefault();
    
    // Validate form
    if (!validateForm()) {
        return;
    }
    
    // Get form data
    const formData = {
        name: document.getElementById('memberName').value,
        email: document.getElementById('memberEmail').value,
        department: document.getElementById('memberDepartment').value,
        position: document.getElementById('memberPosition').value,
        status: document.getElementById('memberStatus').value
    };
    
    // Determine if this is an add or edit
    const isEdit = addMemberForm.dataset.mode === 'edit';
    const memberId = addMemberForm.dataset.memberId;
    
    if (isEdit) {
        formData.id = memberId;
    }
    
    // API endpoint and method
    const url = '/api/members.php';
    const method = isEdit ? 'PUT' : 'POST';
    
    // Send the request
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
            throw new Error(data.message || `Failed to ${isEdit ? 'update' : 'add'} member`);
        }
        
        // Show success notification
        showNotification(`Member ${isEdit ? 'updated' : 'added'} successfully.`, 'success');
        
        // Close the modal and reload members
        closeAddModal();
        loadMembers();
    })
    .catch(error => {
        console.error(`Error ${isEdit ? 'updating' : 'adding'} member:`, error);
        showNotification(`Error ${isEdit ? 'updating' : 'adding'} member. Please try again.`, 'error');
    });
}

/**
 * Confirm and delete a member
 * @param {number} memberId - The ID of the member to delete
 * @param {string} memberName - The name of the member to delete
 */
function confirmDeleteMember(memberId, memberName) {
    if (confirm(`Are you sure you want to remove ${memberName} from the ashram community?`)) {
        fetch(`/api/members.php?id=${memberId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                throw new Error(data.message || 'Failed to delete member');
            }
            
            // Show success notification
            showNotification('Member removed successfully.', 'success');
            
            // Reload members
            loadMembers();
        })
        .catch(error => {
            console.error('Error deleting member:', error);
            showNotification('Error removing member. Please try again.', 'error');
        });
    }
}

/**
 * Set up form validation
 */
function setupFormValidation() {
    const nameInput = document.getElementById('memberName');
    const emailInput = document.getElementById('memberEmail');
    const departmentSelect = document.getElementById('memberDepartment');
    const positionInput = document.getElementById('memberPosition');
    
    // Name validation
    nameInput.addEventListener('blur', function() {
        const error = document.getElementById('nameError');
        if (!nameInput.value.trim()) {
            error.style.display = 'block';
            nameInput.classList.add('error-input');
        } else {
            error.style.display = 'none';
            nameInput.classList.remove('error-input');
        }
    });
    
    // Email validation
    emailInput.addEventListener('blur', function() {
        const error = document.getElementById('emailError');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
            error.style.display = 'block';
            emailInput.classList.add('error-input');
        } else {
            error.style.display = 'none';
            emailInput.classList.remove('error-input');
        }
    });
    
    // Department validation
    departmentSelect.addEventListener('change', function() {
        const error = document.getElementById('departmentError');
        if (!departmentSelect.value) {
            error.style.display = 'block';
            departmentSelect.classList.add('error-input');
        } else {
            error.style.display = 'none';
            departmentSelect.classList.remove('error-input');
        }
    });
    
    // Position validation
    positionInput.addEventListener('blur', function() {
        const error = document.getElementById('positionError');
        if (!positionInput.value.trim()) {
            error.style.display = 'block';
            positionInput.classList.add('error-input');
        } else {
            error.style.display = 'none';
            positionInput.classList.remove('error-input');
        }
    });
}

/**
 * Validate the form before submission
 * @returns {boolean} - Whether the form is valid
 */
function validateForm() {
    let isValid = true;
    
    // Name validation
    const nameInput = document.getElementById('memberName');
    const nameError = document.getElementById('nameError');
    if (!nameInput.value.trim()) {
        nameError.style.display = 'block';
        nameInput.classList.add('error-input');
        isValid = false;
    } else {
        nameError.style.display = 'none';
        nameInput.classList.remove('error-input');
    }
    
    // Email validation
    const emailInput = document.getElementById('memberEmail');
    const emailError = document.getElementById('emailError');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
        emailError.style.display = 'block';
        emailInput.classList.add('error-input');
        isValid = false;
    } else {
        emailError.style.display = 'none';
        emailInput.classList.remove('error-input');
    }
    
    // Department validation
    const departmentSelect = document.getElementById('memberDepartment');
    const departmentError = document.getElementById('departmentError');
    if (!departmentSelect.value) {
        departmentError.style.display = 'block';
        departmentSelect.classList.add('error-input');
        isValid = false;
    } else {
        departmentError.style.display = 'none';
        departmentSelect.classList.remove('error-input');
    }
    
    // Position validation
    const positionInput = document.getElementById('memberPosition');
    const positionError = document.getElementById('positionError');
    if (!positionInput.value.trim()) {
        positionError.style.display = 'block';
        positionInput.classList.add('error-input');
        isValid = false;
    } else {
        positionError.style.display = 'none';
        positionInput.classList.remove('error-input');
    }
    
    return isValid;
}

/**
 * Show a notification message
 * @param {string} message - The message to show
 * @param {string} type - The type of notification ('success' or 'error')
 */
function showNotification(message, type = 'success') {
    // Create notification element if it doesn't exist
    let notification = document.querySelector('.notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    // Set type class
    notification.className = 'notification';
    notification.classList.add(`notification-${type}`);
    
    // Set message
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Show notification
    notification.style.display = 'flex';
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.style.display = 'none';
            notification.style.opacity = '1';
        }, 300);
    }, 3000);
}

/**
 * Debounce function to limit how often a function is called
 * @param {Function} func - The function to debounce
 * @param {number} wait - The time to wait in milliseconds
 * @returns {Function} - The debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}