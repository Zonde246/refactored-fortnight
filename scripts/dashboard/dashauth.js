/**
 * Authentication and User Management for Dashboard
 * Add this script to both dashboard HTML files
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    checkUserAuth();
    
    // Add logout functionality to logout links
    setupLogout();
});

/**
 * Check if user is authenticated and has appropriate permissions
 */
function checkUserAuth() {
    fetch('/api/user.php')
        .then(response => response.json())
        .then(data => {
            if (!data.success || !data.data.logged_in) {
                // User is not logged in, redirect to login page
                window.location.href = '/login.html';
                return;
            }
            
            const user = data.data.user;
            
            // Update user profile in sidebar
            updateUserProfile(user);
            
            // Check if user has appropriate role for this page
            const currentPage = window.location.pathname;
            if (currentPage.includes('/dash.php') || currentPage.includes('/dashMembers.php')) {
                // Only admin and employee can access dashboards
                if (user.role !== 'admin' && user.role !== 'employee') {
                    alert('You do not have permission to access this page.');
                    window.location.href = '/index.php';
                    return;
                }
            }
            
            // Load dashboard data
            if (currentPage.includes('/dash.php')) {
                loadDashboardData(user);
            } else if (currentPage.includes('/dashMembers.php')) {
                loadMembersData(user);
            }
        })
        .catch(error => {
            console.error('Authentication check failed:', error);
            alert('Failed to verify authentication. Please try again.');
            window.location.href = '/login.html';
        });
}

/**
 * Update user profile in sidebar
 */
function updateUserProfile(user) {
    // Update user name and role in the profile section
    const userProfileElement = document.querySelector('.user-profile span');
    if (userProfileElement) {
        userProfileElement.textContent = user.name;
    }
    
    // If there's an image with alt="Admin", update the alt text
    const profileImage = document.querySelector('.user-profile img');
    if (profileImage) {
        profileImage.alt = user.name;
    }
}

/**
 * Set up logout functionality
 */
function setupLogout() {
    const logoutLinks = document.querySelectorAll('a[href="#"][title="Logout"], a[href="#"]:has(i.fa-sign-out-alt)');
    
    logoutLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const formData = new FormData();
            formData.append('action', 'logout');
            
            fetch('/api/authHandler.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = data.redirect || '/login.html';
                } else {
                    alert('Logout failed. Please try again.');
                }
            })
            .catch(error => {
                console.error('Logout failed:', error);
                alert('Logout failed. Please try again.');
            });
        });
    });
}

/**
 * Load dashboard data based on user role
 */
function loadDashboardData(user) {
    // Load member statistics
    fetch('/api/members.php?stats=true')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateDashboardStats(data);
            } else {
                console.error('Failed to load dashboard stats:', data.message);
            }
        })
        .catch(error => {
            console.error('Error loading dashboard data:', error);
        });
    
    // Load member directory
    loadMemberDirectory(user);
}

/**
 * Update dashboard statistics
 */
function updateDashboardStats(data) {
    const stats = data.data || data.stats;
    
    // Update stat cards if they exist
    const statElements = {
        'Total Members': stats.totalMembers,
        'Active Members': stats.activeMembers,
        'On Retreat': stats.onRetreatMembers,
        'New This Month': stats.newThisMonth
    };
    
    // Find stat cards by their headings
    document.querySelectorAll('.stat-card h3').forEach(heading => {
        const title = heading.textContent.trim();
        if (statElements[title] !== undefined) {
            const valueElement = heading.nextElementSibling;
            if (valueElement && valueElement.classList.contains('value')) {
                valueElement.textContent = statElements[title];
            }
        }
    });
}

/**
 * Load member directory
 */
function loadMemberDirectory(user) {
    fetch('/api/members.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                populateMemberTable(data.data || data.members, user);
            } else {
                console.error('Failed to load members:', data.message);
            }
        })
        .catch(error => {
            console.error('Error loading members:', error);
        });
}

/**
 * Populate member table in dashboard
 */
function populateMemberTable(members, currentUser) {
    const tbody = document.getElementById('employeeTable')?.querySelector('tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    members.forEach(member => {
        const tr = document.createElement('tr');
        
        let statusClass = '';
        if (member.status === 'active') statusClass = 'status-active';
        else if (member.status === 'inactive' || member.status === 'onleave') statusClass = 'status-onleave';
        else statusClass = 'status-inactive';
        
        let statusText = member.status;
        if (statusText === 'inactive') statusText = 'On Retreat';
        else statusText = capitalizeFirstLetter(statusText);
        
        tr.innerHTML = `
            <td>${member.id}</td>
            <td>${member.name}</td>
            <td>${member.department || formatRoleAsDepartment(member.role)}</td>
            <td>${member.position || getDepartmentPosition(member.role)}</td>
            <td>${formatDate(member.hireDate || member.created_at)}</td>
            <td><span class="status ${statusClass}">${statusText}</span></td>
            <td>
                <button class="action-btn edit-btn" data-id="${member.id}"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-btn" data-id="${member.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
    
    // Add event listeners to action buttons
    addMemberActionListeners();
}

/**
 * Load members data for the members dashboard
 */
function loadMembersData(user) {
    // Load member statistics
    fetch('/api/members.php?stats=true')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateMembersStats(data);
            } else {
                console.error('Failed to load members stats:', data.message);
            }
        })
        .catch(error => {
            console.error('Error loading members stats:', error);
        });
    
    // Load members for the grid
    loadMembersGrid(user);
}

/**
 * Update members statistics
 */
function updateMembersStats(data) {
    const stats = data.data || data.stats;
    
    // Update stat cards
    if (document.getElementById('totalMembersCard')) {
        document.getElementById('totalMembersCard').querySelector('.value').textContent = stats.totalMembers;
    }
    
    if (document.getElementById('activeMembersCard')) {
        document.getElementById('activeMembersCard').querySelector('.value').textContent = stats.activeMembers;
    }
    
    if (document.getElementById('onRetreatCard')) {
        document.getElementById('onRetreatCard').querySelector('.value').textContent = stats.onRetreatMembers;
    }
    
    if (document.getElementById('newThisMonthCard')) {
        document.getElementById('newThisMonthCard').querySelector('.value').textContent = stats.newThisMonth;
    }
}

/**
 * Load members for the grid
 */
function loadMembersGrid(user) {
    const memberGrid = document.getElementById('memberGrid');
    if (!memberGrid) return;
    
    // Show loading state
    memberGrid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading members...</div>';
    
    // Get filter values if they exist
    const searchInput = document.getElementById('memberSearch');
    const roleFilter = document.getElementById('roleFilter');
    const statusFilter = document.getElementById('statusFilter');
    
    // Build query parameters
    const params = new URLSearchParams();
    
    if (searchInput && searchInput.value) {
        params.append('search', searchInput.value);
    }
    
    if (roleFilter && roleFilter.value) {
        params.append('department', roleFilter.value);
    }
    
    if (statusFilter && statusFilter.value) {
        params.append('status', statusFilter.value);
    }
    
    fetch(`/api/members.php?${params.toString()}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                populateMemberGrid(data.data || data.members, user);
            } else {
                console.error('Failed to load members:', data.message);
                memberGrid.innerHTML = '<div class="error">Failed to load members. Please try again.</div>';
            }
        })
        .catch(error => {
            console.error('Error loading members:', error);
            memberGrid.innerHTML = '<div class="error">Error loading members. Please try again.</div>';
        });
}

/**
 * Populate member grid
 */
function populateMemberGrid(members, currentUser) {
    const memberGrid = document.getElementById('memberGrid');
    if (!memberGrid) return;
    
    memberGrid.innerHTML = '';
    
    if (!members || members.length === 0) {
        memberGrid.innerHTML = '<div class="no-results">No members found matching your criteria. Try adjusting your filters.</div>';
        return;
    }
    
    members.forEach(member => {
        const memberCard = createMemberCard(member);
        memberGrid.appendChild(memberCard);
    });
    
    // Add event listeners to action buttons
    addMemberActionListeners();
}

/**
 * Create a member card
 */
function createMemberCard(member) {
    const card = document.createElement('div');
    card.className = 'member-card';
    
    // Create status class based on member status
    let statusClass = 'status-active';
    if (member.status === 'inactive' || member.status === 'onleave') {
        statusClass = 'status-onleave';
    } else if (member.status === 'banned') {
        statusClass = 'status-inactive';
    }
    
    // Format status text
    let statusText = member.status;
    if (statusText === 'inactive') {
        statusText = 'On Retreat';
    } else {
        statusText = capitalizeFirstLetter(statusText);
    }
    
    // Calculate first letter of name for avatar
    const nameParts = member.name.split(' ');
    const initials = nameParts.map(part => part.charAt(0)).join('').toUpperCase();
    
    // Format date
    const joinDate = member.hireDate || member.created_at;
    const formattedDate = formatDate(joinDate);
    
    // Format role as department
    const department = member.department || formatRoleAsDepartment(member.role);
    const position = member.position || getDepartmentPosition(member.role);
    
    card.innerHTML = `
        <div class="member-avatar">
            <span>${initials}</span>
        </div>
        <div class="member-info">
            <h3>${member.name}</h3>
            <p class="member-role">${department}</p>
            <p class="member-position">${position}</p>
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
    
    return card;
}

/**
 * Add event listeners to member action buttons
 */
function addMemberActionListeners() {
    // Edit buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const memberId = this.getAttribute('data-id');
            if (window.location.pathname.includes('/dash.php')) {
                openEditModal(memberId);
            } else {
                editMember(memberId);
            }
        });
    });
    
    // Delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const memberId = this.getAttribute('data-id');
            if (confirm('Are you sure you want to remove this member?')) {
                deleteMember(memberId);
            }
        });
    });
}

/**
 * Format role as department
 */
function formatRoleAsDepartment(role) {
    switch (role) {
        case 'admin':
            return 'Teacher';
        case 'employee':
            return 'Staff';
        case 'user':
            return 'Student';
        default:
            return 'Visitor';
    }
}

/**
 * Get department position
 */
function getDepartmentPosition(role) {
    switch (role) {
        case 'admin':
            return 'Meditation, Yoga';
        case 'employee':
            return 'Ashram Operations';
        case 'user':
            return 'Spiritual Practice';
        default:
            return 'Ashram Member';
    }
}

/**
 * Format date
 */
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

/**
 * Capitalize first letter
 */
function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Edit member
 */
function editMember(memberId) {
    fetch(`/api/members.php?id=${memberId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const member = data.data || data.member;
                
                // Find the form based on which page we're on
                let form;
                let modal;
                
                if (window.location.pathname.includes('/dash.php')) {
                    form = document.getElementById('employeeForm');
                    modal = document.getElementById('employeeModal');
                    
                    if (form && modal) {
                        // Set form values
                        document.getElementById('modalTitle').textContent = 'Edit Member';
                        document.getElementById('employeeId').value = member.id;
                        document.getElementById('name').value = member.name;
                        document.getElementById('email').value = member.email;
                        document.getElementById('department').value = member.department || formatRoleAsDepartment(member.role);
                        document.getElementById('position').value = member.position || getDepartmentPosition(member.role);
                        document.getElementById('hireDate').value = formatDateForInput(member.hireDate || member.created_at);
                        document.getElementById('status').value = member.status === 'onleave' ? 'inactive' : member.status;
                        
                        // Show modal
                        modal.style.display = 'flex';
                    }
                } else {
                    form = document.getElementById('addMemberForm');
                    modal = document.getElementById('addMemberModal');
                    
                    if (form && modal) {
                        // Set form values
                        form.dataset.mode = 'edit';
                        form.dataset.memberId = member.id;
                        document.querySelector('.modal-header h2').innerHTML = '<i class="fas fa-user-edit"></i> Edit Member';
                        document.getElementById('memberName').value = member.name;
                        document.getElementById('memberEmail').value = member.email;
                        document.getElementById('memberDepartment').value = member.department || formatRoleAsDepartment(member.role);
                        document.getElementById('memberPosition').value = member.position || getDepartmentPosition(member.role);
                        document.getElementById('memberStatus').value = member.status === 'onleave' ? 'inactive' : member.status;
                        
                        // Hide all error messages
                        document.querySelectorAll('.error').forEach(el => el.style.display = 'none');
                        
                        // Show modal
                        modal.style.display = 'block';
                    }
                }
            } else {
                alert('Failed to load member details. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error loading member details:', error);
            alert('Error loading member details. Please try again.');
        });
}

/**
 * Delete member
 */
function deleteMember(memberId) {
    fetch(`/api/members.php?id=${memberId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Member removed successfully.');
            
            // Reload the page to refresh data
            window.location.reload();
        } else {
            alert('Failed to remove member: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error deleting member:', error);
        alert('Error removing member. Please try again.');
    });
}

/**
 * Format date for input fields (YYYY-MM-DD)
 */
function formatDateForInput(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}