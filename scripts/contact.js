// Contact form validation and submission handler
document.addEventListener('DOMContentLoaded', () => {
    // Get form elements
    const contactForm = document.querySelector('.contact-form form');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const inquirySelect = document.getElementById('inquiry');
    const messageInput = document.getElementById('message');
    const submitButton = document.getElementById('contact');
    
    // Add event listener to the form submission
    contactForm.addEventListener('submit', handleFormSubmit);
    
    // Form submission handler
    function handleFormSubmit(e) {
        e.preventDefault();
        
        // Clear previous errors
        clearAllErrors();
        
        // Validate form inputs
        let isValid = validateForm();
        
        if (isValid) {
            submitForm();
        }
    }
    
    // Validation functions
    function validateForm() {
        let isValid = true;
        
        // Validate name
        if (!nameInput.value.trim()) {
            showError(nameInput, 'Name is required');
            isValid = false;
        } else if (nameInput.value.trim().length < 2) {
            showError(nameInput, 'Name must be at least 2 characters');
            isValid = false;
        }
        
        // Validate email
        if (!emailInput.value.trim()) {
            showError(emailInput, 'Email is required');
            isValid = false;
        } else if (!validateEmail(emailInput.value)) {
            showError(emailInput, 'Please enter a valid email address');
            isValid = false;
        }
        
        // Validate phone if provided (optional field)
        if (phoneInput.value.trim() && !validatePhone(phoneInput.value)) {
            showError(phoneInput, 'Please enter a valid phone number');
            isValid = false;
        }
        
        // Validate message
        if (!messageInput.value.trim()) {
            showError(messageInput, 'Message is required');
            isValid = false;
        } else if (messageInput.value.trim().length < 20) {
            showError(messageInput, 'Please provide a more detailed message (at least 20 characters)');
            isValid = false;
        }
        
        return isValid;
    }
    
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function validatePhone(phone) {
        // Basic phone validation - allows various formats
        const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
        return phoneRegex.test(phone);
    }
    
    // Error handling functions
    function showError(input, message) {
        // Remove any existing error
        removeError(input);
        
        // Create error element
        const errorElement = document.createElement('div');
        errorElement.className = 'form-error';
        errorElement.textContent = message;
        errorElement.style.color = '#e15270';
        errorElement.style.fontSize = '0.8rem';
        errorElement.style.marginTop = '0.3rem';
        
        // Insert after the input
        input.parentElement.appendChild(errorElement);
        
        // Highlight the input
        input.style.borderColor = '#e15270';
    }
    
    function removeError(input) {
        const errorElement = input.parentElement.querySelector('.form-error');
        if (errorElement) {
            errorElement.remove();
        }
        input.style.borderColor = '';
    }
    
    function clearAllErrors() {
        [nameInput, emailInput, phoneInput, messageInput].forEach(input => {
            removeError(input);
        });
        
        // Remove any existing global messages
        const existingMessage = contactForm.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }
    }
    
    // Form submission function
    function submitForm() {
        // Collect form data
        const formData = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            phone: phoneInput.value.trim(),
            inquiry: inquirySelect.value,
            message: messageInput.value.trim()
        };
        
        // Show loading state
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;
        
        // Log form data
        console.log('Form submission:', formData);
        
        // Simulate form processing
        setTimeout(() => {
            // Create success message
            const messageElement = document.createElement('div');
            messageElement.className = 'form-message';
            messageElement.textContent = 'Thank you for your message! We will get back to you shortly.';
            messageElement.style.backgroundColor = '#d4edda';
            messageElement.style.color = '#155724';
            messageElement.style.padding = '1rem';
            messageElement.style.borderRadius = '4px';
            messageElement.style.marginTop = '1rem';
            messageElement.style.textAlign = 'center';
            
            // Insert at the end of the form
            contactForm.appendChild(messageElement);
            
            // Reset form
            contactForm.reset();
            
            // Reset button state
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            
            // Scroll to the message
            messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Remove success message after some time
            setTimeout(() => {
                messageElement.style.opacity = '0';
                messageElement.style.transition = 'opacity 1s ease';
                
                setTimeout(() => {
                    messageElement.remove();
                }, 1000);
            }, 5000);
        }, 1500); // Simulate network delay
    }
    
    // Add input event listeners to clear errors when user types
    [nameInput, emailInput, phoneInput, messageInput].forEach(input => {
        input.addEventListener('input', () => {
            removeError(input);
        });
    });
});