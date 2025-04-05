class NavigationBar extends HTMLElement {
  constructor() {
    super();
    this.currentUser = null;
  }

  connectedCallback() {
    // First, try to get the current user data
    this.checkUserAuthentication()
      .then(() => {
        this.render();
        this.addEventListeners();
      });
  }

  // Fetch user authentication status from the server
  async checkUserAuthentication() {
    try {
      // You'll need to create this endpoint to return the current user's session info
      const response = await fetch('/api/checkAuth.php');
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          this.currentUser = data.user;
        }
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
    }
  }

  render() {
    // Generate different navigation items based on user role
    const userNav = this.generateNavItems();
    const authSection = this.generateAuthSection();

    this.innerHTML = `
      <header>
        <nav class="top-nav">
          <a href="/" class="logo">Shanti<span>Ashram</span></a>
          
          <!-- Hamburger Menu Button -->
          <div class="hamburger-menu" id="hamburger-toggle">
            <span></span>
            <span></span>
            <span></span>
          </div>
          
          <ul class="nav-links" id="nav-menu">
            <li><a href="/">Home</a></li>
            <li><a href="/about.html">About</a></li>
            ${userNav}
            <li><a href="/contact.html">Contact us</a></li>
            ${authSection}
          </ul>
        </nav>
      </header>
    `;
  }

  generateNavItems() {
    let navItems = '';
    
    // Basic navigation for all users
    // navItems += `<li><a href="./prot/booking.html">Programs</a></li>`;
    
    // Navigation items for logged-in users
    if (this.currentUser) {
      navItems += `
        <li><a href="./prot/booking.html">Booking</a></li>
        <li><a href="./courses.html">Courses</a></li>
      `;
      
      // Employee-specific navigation
      if (this.currentUser.role === 'employee') {
        navItems += `<li><a href="./dashboard-employee.html">Dashboard - E</a></li>`;
      }
      
      // Admin-specific navigation
      if (this.currentUser.role === 'admin') {
        navItems += `<li><a href="./dashboard.html">Dashboard</a></li>`;
      }
    }
    
    return navItems;
  }

  generateAuthSection() {
    if (this.currentUser) {
      // Return profile dropdown for logged-in users
      // <a href="./profile.html">My Profile</a>
      // <a href="./settings.html">Settings</a>
      return `
        <li class="user-account-dropdown">
          <a href="#" class="account-btn" id="account-dropdown-toggle">
            <i class="fas fa-user-circle"></i>
            <span>${this.currentUser.name}</span>
          </a>
          <div class="dropdown-content" id="account-dropdown">
            <hr>
            <a href="#" id="logout-btn">Log Out</a>
          </div>
        </li>
      `;
    } else {
      // Return login/signup links for guests
      return `<li><a href="./login.html">Login</a></li>`;
    }
  }

  addEventListeners() {
    // Hamburger menu toggle
    const hamburgerToggle = this.querySelector('#hamburger-toggle');
    const navMenu = this.querySelector('#nav-menu');
    
    if (hamburgerToggle && navMenu) {
      hamburgerToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburgerToggle.classList.toggle('active');
      });
    }
    
    // Account dropdown toggle
    const accountToggle = this.querySelector('#account-dropdown-toggle');
    const accountDropdown = this.querySelector('#account-dropdown');
    
    if (accountToggle && accountDropdown) {
      accountToggle.addEventListener('click', (e) => {
        e.preventDefault();
        accountDropdown.classList.toggle('show');
      });
      
      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!accountToggle.contains(e.target) && !accountDropdown.contains(e.target)) {
          accountDropdown.classList.remove('show');
        }
      });
    }
    
    // Logout button
    const logoutBtn = this.querySelector('#logout-btn');
    
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Send logout request to server
        fetch('/api/authHandler.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: 'action=logout'
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            // Redirect to home or login page
            window.location.href = data.data?.redirect || './';
          }
        })
        .catch(error => {
          console.error('Logout error:', error);
        });
      });
    }
  }
}

// Register the custom element
customElements.define('navigation-bar', NavigationBar);