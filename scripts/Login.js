document.addEventListener('DOMContentLoaded', () => {
    const card = document.getElementById('portal-card');
    const toSignup = document.getElementById('toggle-to-signup');
    const toLogin = document.getElementById('toggle-to-login');

    // Function to handle card flip animation
    const handleFlip = () => {
        card.classList.toggle('flip');
    };

    toSignup.addEventListener('click', handleFlip);
    toLogin.addEventListener('click', handleFlip);
});

// Form validation and submission handler
document.addEventListener('DOMContentLoaded', () => {
    // Get form elements
    const loginForm = document.querySelector('.front .form-section');
    const signupForm = document.querySelector('.back .form-section');
    
    // Get toggle buttons
    const toggleToSignup = document.getElementById('toggle-to-signup');
    const toggleToLogin = document.getElementById('toggle-to-login');
    
    // Get the portal card for flip animation
    const portalCard = document.getElementById('portal-card');
    
    // Form fields
    const loginEmail = document.getElementById('login-email');
    const loginPassword = document.getElementById('login-password');
    const signupName = document.getElementById('signup-name');
    const signupEmail = document.getElementById('signup-email');
    const signupPassword = document.getElementById('signup-password');
    
    // Add card flip functionality
    toggleToSignup.addEventListener('click', () => {
        portalCard.classList.add('flipped');
    });
    
    toggleToLogin.addEventListener('click', () => {
        portalCard.classList.remove('flipped');
    });
    
    // Validation functions
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };
    
    const validatePassword = (password) => {
        // Check minimum length of 8 characters
        if (password.length < 8) {
            return false;
        }
        
        // Check for at least one special character
        const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
        if (!specialCharRegex.test(password)) {
            return false;
        }
        
        // Check for at least one number
        const numberRegex = /[0-9]+/;
        if (!numberRegex.test(password)) {
            return false;
        }
        
        return true;
    };
    
    const validateName = (name) => {
        return name.trim().length >= 2; // At least 2 characters
    };
    
    // Show error message
    const showError = (input, message) => {
        // Remove any existing error
        removeError(input);
        
        // Create error element
        const errorElement = document.createElement('div');
        errorElement.className = 'form-error';
        errorElement.textContent = message;
        errorElement.style.color = '#e15270';
        errorElement.style.fontSize = '0.8rem';
        errorElement.style.marginTop = '0.3rem';
        
        // Insert after the input group
        input.parentElement.appendChild(errorElement);
        
        // Highlight the input
        input.style.borderColor = '#e15270';
    };
    
    // Remove error message
    const removeError = (input) => {
        const errorElement = input.parentElement.querySelector('.form-error');
        if (errorElement) {
            errorElement.remove();
        }
        input.style.borderColor = '';
    };
    
    // Show global message (error or success)
    const showGlobalMessage = (form, message, isSuccess = false) => {
        // Remove any existing messages
        const existingMessage = form.querySelector('.form-error-global, .form-success-global');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = isSuccess ? 'form-success-global' : 'form-error-global';
        messageElement.textContent = message;
        messageElement.style.color = isSuccess ? '#28a745' : '#e15270';
        messageElement.style.marginTop = '1rem';
        messageElement.style.textAlign = 'center';
        
        form.appendChild(messageElement);
        
        return messageElement;
    };
    
    // Handle login form submission
    loginForm.querySelector('button[type="button"]').addEventListener('click', (e) => {
        e.preventDefault();
        let isValid = true;
        
        // Clear previous errors
        removeError(loginEmail);
        removeError(loginPassword);
        
        // Validate email
        if (!loginEmail.value.trim()) {
            showError(loginEmail, 'Email is required');
            isValid = false;
        } else if (!validateEmail(loginEmail.value)) {
            showError(loginEmail, 'Please enter a valid email address');
            isValid = false;
        }
        
        // Validate password
        if (!loginPassword.value) {
            showError(loginPassword, 'Password is required');
            isValid = false;
        }
        
        // If form is valid, submit
        if (isValid) {
            handleLoginSubmit();
        }
    });
    
    // Handle signup form submission
    signupForm.querySelector('button[type="button"]').addEventListener('click', (e) => {
        e.preventDefault();
        let isValid = true;
        
        // Clear previous errors
        removeError(signupName);
        removeError(signupEmail);
        removeError(signupPassword);
        
        // Validate name
        if (!signupName.value.trim()) {
            showError(signupName, 'Name is required');
            isValid = false;
        } else if (!validateName(signupName.value)) {
            showError(signupName, 'Name must be at least 2 characters');
            isValid = false;
        }
        
        // Validate email
        if (!signupEmail.value.trim()) {
            showError(signupEmail, 'Email is required');
            isValid = false;
        } else if (!validateEmail(signupEmail.value)) {
            showError(signupEmail, 'Please enter a valid email address');
            isValid = false;
        }
        
        // Validate password
        if (!signupPassword.value) {
            showError(signupPassword, 'Password is required');
            isValid = false;
        } else if (!validatePassword(signupPassword.value)) {
            // Check specific password requirements and show detailed errors
            if (signupPassword.value.length < 8) {
                showError(signupPassword, 'Password must be at least 8 characters long');
                isValid = false;
            } else if (!/[0-9]/.test(signupPassword.value)) {
                showError(signupPassword, 'Password must include at least one number');
                isValid = false;
            } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(signupPassword.value)) {
                showError(signupPassword, 'Password must include at least one special character');
                isValid = false;
            }
        }
        
        // If form is valid, submit
        if (isValid) {
            handleSignupSubmit();
        }
    });
    
    // Form submission functions - Updated to use AuthHandler.php
    const handleLoginSubmit = () => {
        // Prepare form data for submission
        const formData = new FormData();
        formData.append('action', 'login');
        formData.append('email', loginEmail.value.trim());
        formData.append('password', loginPassword.value);
        
        // Show loading state
        const loginButton = loginForm.querySelector('button[type="button"]');
        const originalText = loginButton.textContent;
        loginButton.textContent = 'Signing in...';
        loginButton.disabled = true;
        
        // Send request to API endpoint
        fetch('/api/authHandler.php', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Handle successful login
                const successMessage = showGlobalMessage(loginForm, data.message, true);
                
                // Redirect to the specified page after a delay
                setTimeout(() => {
                    window.location.href = './index.html';
                }, 1500);
            } else {
                // Show error message
                showGlobalMessage(loginForm, data.message);
            }
        })
        .catch(error => {
            console.error('Login error:', error);
            showGlobalMessage(loginForm, 'An error occurred. Please try again.');
        })
        .finally(() => {
            // Reset button state
            loginButton.textContent = originalText;
            loginButton.disabled = false;
        });
    };
    
    const handleSignupSubmit = () => {
        // Prepare form data for submission
        const formData = new FormData();
        formData.append('action', 'signup');
        formData.append('name', signupName.value.trim());
        formData.append('email', signupEmail.value.trim());
        formData.append('password', signupPassword.value);
        
        // Show loading state
        const signupButton = signupForm.querySelector('button[type="button"]');
        const originalText = signupButton.textContent;
        signupButton.textContent = 'Creating account...';
        signupButton.disabled = true;
        
        // Send request to API endpoint
        fetch('/api/authHandler.php', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Handle successful signup
                const successMessage = showGlobalMessage(signupForm, data.message, true);
                
                // Redirect to login after a delay
                setTimeout(() => {
                    // Flip the card to login side
                    portalCard.classList.remove('flipped');
                    
                    // Clear signup form
                    signupName.value = '';
                    signupEmail.value = '';
                    signupPassword.value = '';
                    
                    // Pre-fill login email
                    loginEmail.value = data.data.email;
                    
                    // Remove success message after redirect
                    successMessage.remove();
                }, 2000);
            } else {
                // Show error message
                showGlobalMessage(signupForm, data.message);
            }
        })
        .catch(error => {
            console.error('Signup error:', error);
            showGlobalMessage(signupForm, 'An error occurred. Please try again.');
        })
        .finally(() => {
            // Reset button state
            signupButton.textContent = originalText;
            signupButton.disabled = false;
        });
    };
    
    // Add input event listeners to clear errors when user types
    [loginEmail, loginPassword, signupName, signupEmail, signupPassword].forEach(input => {
        input.addEventListener('input', () => {
            removeError(input);
        });
    });
});