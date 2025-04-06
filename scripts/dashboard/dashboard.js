/**
 * Ashram Community Management Dashboard JavaScript
 * 
 * This file handles all the dynamic functionality of the dashboard.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the dashboard
    initializeDashboard();
    
    // Event listeners
    document.getElementById('addMemberBtn').addEventListener('click', openAddModal);
    document.querySelector('.close').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('memberForm').addEventListener('submit', saveMember);
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    document.getElementById('search-input').addEventListener('input', debounce(searchMembers, 500));
    
    // Initial data loading
    loadMembers();
    loadChartData();
});

// Current page for pagination
let currentPage = 1;
const itemsPerPage = 8; // Number of items per page
let allMembers = []; // Store all members for pagination and filtering

/**
 * Initialize dashboard elements
 */
function initializeDashboard() {
    // Initialize any required components
    console.log('Dashboard initialized');
}

/**
 * Load members from API
 */
function loadMembers(searchTerm = '') {
    // Show loading indicator or skeleton loading (if implemented)
    
    // Prepare URL with optional search parameter
    let url = '/api/Dashboard/members.php';
    if (searchTerm) {
        url += `?search=${encodeURIComponent(searchTerm)}`;
    }
    
    // Fetch members from API
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Store all members for pagination
                allMembers = data.data.members;
                
                // Update stats cards
                updateStatsCards(data.data.stats);
                
                // Paginate and display members
                paginateMembers(1); // Start at first page
            } else {
                showAlert(data.message, 'danger');
            }
        })
        .catch(error => {
            console.error('Error loading members:', error);
            showAlert('Failed to load members. Please try again.', 'danger');
        });
}

/**
 * Update stats cards with real data
 */
function updateStatsCards(stats) {
    if (!stats) return;
    
    // Total members
    const totalMembersCard = document.getElementById('total-members-card');
    totalMembersCard.querySelector('.value').textContent = stats.total;
    
    const totalChange = totalMembersCard.querySelector('.change span');
    totalChange.textContent = `${stats.last_month.total_increase}% from last month`;
    
    // Active members
    const activeMembersCard = document.getElementById('active-members-card');
    activeMembersCard.querySelector('.value').textContent = stats.active;
    
    const activeChange = activeMembersCard.querySelector('.change span');
    activeChange.textContent = `${stats.last_month.active_increase}% from last month`;
    
    // Inactive members
    const inactiveMembersCard = document.getElementById('inactive-members-card');
    inactiveMembersCard.querySelector('.value').textContent = stats.inactive;
    
    const inactiveChange = inactiveMembersCard.querySelector('.change span');
    inactiveChange.textContent = `${stats.last_month.inactive_decrease}% from last month`;
    
    // Participation
    const participationCard = document.getElementById('participation-card');
    participationCard.querySelector('.value').textContent = `${stats.participation}%`;
    
    const participationChange = participationCard.querySelector('.change span');
    participationChange.textContent = `${stats.last_month.participation_increase}% from last month`;
}

/**
 * Paginate members
 */
function paginateMembers(page) {
    // Update current page
    currentPage = page;
    
    // Calculate start and end indices
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    // Get current page items
    const paginatedMembers = allMembers.slice(startIndex, endIndex);
    
    // Populate table
    populateMembersTable(paginatedMembers);
    
    // Update pagination controls
    updatePagination();
}

/**
 * Populate members table
 */
function populateMembersTable(members) {
    const tbody = document.getElementById('memberTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    if (members.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="7" style="text-align: center;">No members found</td>';
        tbody.appendChild(tr);
        return;
    }
    
    members.forEach(member => {
        const tr = document.createElement('tr');
        
        let statusClass = '';
        if (member.status === 'active') statusClass = 'status-active';
        else if (member.status === 'inactive') statusClass = 'status-inactive';
        
        let statusText = capitalizeFirstLetter(member.status);
        
        // Format join date
        const joinDate = new Date(member.created_at);
        const formattedDate = joinDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        
        tr.innerHTML = `
            <td>${member.id}</td>
            <td>${member.name}</td>
            <td>${capitalizeFirstLetter(member.role)}</td>
            <td>${member.email}</td>
            <td>${formattedDate}</td>
            <td><span class="status ${statusClass}">${statusText}</span></td>
            <td>
                <button class="action-btn edit-btn" data-id="${member.id}"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-btn" data-id="${member.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            openEditModal(id);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            if (confirm('Are you sure you want to remove this member?')) {
                deleteMember(id);
            }
        });
    });
}

/**
 * Update pagination controls
 */
function updatePagination() {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    
    // Calculate total pages
    const totalPages = Math.ceil(allMembers.length / itemsPerPage);
    
    if (totalPages <= 1) {
        return; // No pagination needed
    }
    
    // Add Previous button
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            paginateMembers(currentPage - 1);
        }
    });
    pagination.appendChild(prevButton);
    
    // Add page buttons
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        if (i === currentPage) {
            pageButton.classList.add('active');
        }
        pageButton.addEventListener('click', () => paginateMembers(i));
        pagination.appendChild(pageButton);
    }
    
    // Add Next button
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            paginateMembers(currentPage + 1);
        }
    });
    pagination.appendChild(nextButton);
}

/**
 * Open modal in add mode
 */
function openAddModal() {
    document.getElementById('modalTitle').textContent = 'Add New Member';
    document.getElementById('memberForm').reset();
    document.getElementById('memberId').value = '';
    document.getElementById('memberModal').style.display = 'flex';
}

/**
 * Open modal in edit mode
 */
function openEditModal(id) {
    // Find member by ID
    const member = allMembers.find(m => m.id === id);
    if (!member) return;
    
    document.getElementById('modalTitle').textContent = 'Edit Member';
    document.getElementById('memberId').value = member.id;
    document.getElementById('name').value = member.name;
    document.getElementById('email').value = member.email;
    document.getElementById('role').value = member.role;
    document.getElementById('password').value = ''; // Clear password field
    document.getElementById('status').value = member.status;
    
    document.getElementById('memberModal').style.display = 'flex';
}

/**
 * Close modal
 */
function closeModal() {
    document.getElementById('memberModal').style.display = 'none';
}

/**
 * Save member (add or update)
 */
function saveMember(e) {
    e.preventDefault();
    
    // Get form data
    const memberId = document.getElementById('memberId').value;
    const formData = new FormData();
    
    // Add form fields to FormData
    formData.append('id', memberId);
    formData.append('name', document.getElementById('name').value);
    formData.append('email', document.getElementById('email').value);
    formData.append('role', document.getElementById('role').value);
    formData.append('status', document.getElementById('status').value);
    
    // Only include password if it's provided
    const password = document.getElementById('password').value;
    if (password) {
        formData.append('password', password);
    }
    
    // Send request to API
    fetch('/api/Dashboard/members.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closeModal();
            showAlert(data.message, 'success');
            loadMembers(); // Reload members
        } else {
            showAlert(data.message, 'danger');
        }
    })
    .catch(error => {
        console.error('Error saving member:', error);
        showAlert('Failed to save member. Please try again.', 'danger');
    });
}

/**
 * Delete member
 */
function deleteMember(id) {
    fetch('/api/Dashboard/members.php', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: id })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlert(data.message, 'success');
            loadMembers(); // Reload members
        } else {
            showAlert(data.message, 'danger');
        }
    })
    .catch(error => {
        console.error('Error deleting member:', error);
        showAlert('Failed to delete member. Please try again.', 'danger');
    });
}

/**
 * Handle logout
 */
function handleLogout(e) {
    e.preventDefault();
    
    // Send logout request to server
    fetch('/api/logout.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Redirect to login page
                window.location.href = '/index.html';
            } else {
                showAlert(data.message, 'danger');
            }
        })
        .catch(error => {
            console.error('Logout error:', error);
            showAlert('Failed to logout. Please try again.', 'danger');
        });
}

/**
 * Search members
 */
function searchMembers(event) {
    const searchTerm = event.target.value.trim();
    loadMembers(searchTerm);
}

/**
 * Load chart data
 */
function loadChartData() {
    fetch('/api/Dashboard/stats.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                initAttendanceChart(data.data.attendance);
                initPerformanceChart(data.data.progress);
            } else {
                console.error('Failed to load chart data:', data.message);
            }
        })
        .catch(error => {
            console.error('Error loading chart data:', error);
        });
}

/**
 * Initialize attendance chart
 */
function initAttendanceChart(data) {
    const ctx = document.getElementById('attendanceChart').getContext('2d');
    
    // Custom colors from the color scheme
    const chartColors = {
        primary: '#732ddb',
        secondary: '#eb8dc4',
        accent: '#e15270',
        lightPrimary: 'rgba(115, 45, 219, 0.2)',
        lightSecondary: 'rgba(235, 141, 196, 0.2)'
    };
    
    // Check if chart instance already exists and destroy it
    if (window.attendanceChart) {
        window.attendanceChart.destroy();
    }
    
    window.attendanceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.categories,
            datasets: [
                {
                    label: data.series[0].name,
                    data: data.series[0].data,
                    backgroundColor: chartColors.primary
                },
                {
                    label: data.series[1].name,
                    data: data.series[1].data,
                    backgroundColor: chartColors.accent
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Members'
                    }
                }
            }
        }
    });
}

/**
 * Initialize performance chart
 */
function initPerformanceChart(data) {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    
    // Custom colors from the color scheme
    const chartColors = {
        primary: '#732ddb',
        secondary: '#eb8dc4',
        accent: '#e15270'
    };
    
    // Check if chart instance already exists and destroy it
    if (window.performanceChart) {
        window.performanceChart.destroy();
    }
    
    window.performanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.categories,
            datasets: [
                {
                    label: data.series[0].name,
                    data: data.series[0].data,
                    borderColor: chartColors.primary,
                    tension: 0.1,
                    fill: false
                },
                {
                    label: data.series[1].name,
                    data: data.series[1].data,
                    borderColor: chartColors.secondary,
                    tension: 0.1,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Average Hours'
                    }
                }
            }
        }
    });
}

/**
 * Show alert message
 */
function showAlert(message, type = 'success') {
    const alertElement = document.getElementById('alert-message');
    alertElement.textContent = message;
    alertElement.className = type === 'success' ? 'alert-success' : 'alert-danger';
    alertElement.style.display = 'block';
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        alertElement.style.display = 'none';
    }, 5000);
}

/**
 * Capitalize first letter of a string
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Debounce function to limit how often a function can be called
 */
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}