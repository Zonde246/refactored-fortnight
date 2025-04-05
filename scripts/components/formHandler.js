// Newsletter subscription form handler
document.addEventListener('DOMContentLoaded', () => {
    // Get the newsletter form element
    const newsletterForm = document.querySelector('.FooterContact-form');
    
    // Only proceed if the form exists on the page
    if (newsletterForm) {
        const emailInput = newsletterForm.querySelector('input[type="email"]');
        const submitButton = newsletterForm.querySelector('.submit-btn');
        
        // Add submit event listener to the form
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get email value and trim whitespace
            const email = emailInput.value.trim();
            
            // Clear any previous messages
            removeMessage();
            
            // Validate email
            if (!email) {
                showMessage('Please enter your email address', 'error');
                return;
            }
            
            if (!validateEmail(email)) {
                showMessage('Please enter a valid email address', 'error');
                return;
            }
            
            // Show loading state
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
            
            // Simulate subscription request (replace with actual API call later)
            setTimeout(() => {
                console.log('Newsletter subscription for:', email);
                
                // Show success message
                showMessage('Thank you for subscribing!', 'success');
                
                // Reset the form
                emailInput.value = '';
                
                // Reset button state
                submitButton.textContent = 'Subscribe';
                submitButton.disabled = false;
                
                // Automatically remove success message after some time
                setTimeout(removeMessage, 5000);
            }, 1000);
        });
        
        // Email validation function
        function validateEmail(email) {
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return regex.test(email);
        }
        
        // Show message function
        function showMessage(text, type) {
            // Remove any existing message
            removeMessage();
            
            // Create message element
            const messageElement = document.createElement('div');
            messageElement.className = `newsletter-message ${type}`;
            messageElement.textContent = text;
            
            // Style the message based on type
            if (type === 'error') {
                messageElement.style.color = '#e15270';
            } else {
                messageElement.style.color = '#28a745';
            }
            
            messageElement.style.fontSize = '0.8rem';
            messageElement.style.marginTop = '0.5rem';
            
            // Add message to the form
            newsletterForm.appendChild(messageElement);
        }
        
        // Remove message function
        function removeMessage() {
            const messageElement = newsletterForm.querySelector('.newsletter-message');
            if (messageElement) {
                messageElement.remove();
            }
        }
        
        // Add input event listener to clear error when user types
        emailInput.addEventListener('input', function() {
            const messageElement = newsletterForm.querySelector('.newsletter-message.error');
            if (messageElement) {
                messageElement.remove();
            }
        });
    }
});