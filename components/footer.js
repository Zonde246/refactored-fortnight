// components/footer.js
class FooterComponent extends HTMLElement {
  constructor() {
    super();
  }
  
  connectedCallback() {
    this.innerHTML = `
      <footer>
        <div class="footer-content">
          <div class="footer-col">
            <h3>About Shanti Ashram</h3>
            <p>Founded in 1985, our ashram is dedicated to preserving and sharing authentic spiritual traditions in a peaceful, inclusive environment.</p>
            <div class="social-links">
              <a href="#" class="social-link">FB</a>
              <a href="#" class="social-link">IG</a>
              <a href="#" class="social-link">YT</a>
            </div>
          </div>
          <div class="footer-col">
            <h3>Quick Links</h3>
            <ul class="footer-links">
              <li><a href="/about.html">About Us</a></li>
              <li><a href="/prot/booking.html">Accommodation</a></li>
              <li><a href="/contact.html">Directions</a></li>
              <li><a href="/login.html">Sign In</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h3>Contact Us</h3>
            <p>123 Meditation Path<br>Peaceful Valley, SP 12345</p>
            <p>Name: Parikshieth Harish<br>RegNo: 23BCA0127</p>
            <p>Name: G Megamala<br>RegNo: 23BCA0152</p>
          </div>
          <div class="footer-col">
            <h3>Newsletter</h3>
            <p>Subscribe to receive updates on events and special offers.</p>
            <form class="FooterContact-form">
              <input type="email" placeholder="Your Email">
              <button type="submit" class="submit-btn">Subscribe</button>
              <div class="message-container"></div>
            </form>
          </div>
        </div>
        <div class="copyright">
          <p>&copy; 2025 Shanti Ashram. All Rights Reserved.</p>
          <p>Developed by ZonDe19 & Hoodie</p>
        </div>
      </footer>
    `;
    
    // Set up form handling
    this.setupFormHandler();
  }
  
  setupFormHandler() {
    const form = this.querySelector('.FooterContact-form');
    const messageContainer = this.querySelector('.message-container');
    
    if (form) {
      const emailInput = form.querySelector('input[type="email"]');
      const submitButton = form.querySelector('.submit-btn');
      
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get and validate email
        const email = emailInput.value.trim();
        
        // Clear any previous messages
        messageContainer.innerHTML = '';
        
        if (!email) {
          this.showMessage('Please enter your email address', 'error');
          return;
        }
        
        if (!this.validateEmail(email)) {
          this.showMessage('Please enter a valid email address', 'error');
          return;
        }
        
        // Email is valid - show success message
        this.showMessage('Thank you for subscribing!', 'success');
        
        // Reset form
        emailInput.value = '';
        
        // Remove message after 5 seconds
        setTimeout(() => {
          messageContainer.innerHTML = '';
        }, 5000);
      });
      
      // Clear error message when typing
      emailInput.addEventListener('input', () => {
        const errorMessage = messageContainer.querySelector('.error');
        if (errorMessage) {
          errorMessage.remove();
        }
      });
    }
  }
  
  validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
  
  showMessage(text, type) {
    const messageContainer = this.querySelector('.message-container');
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `newsletter-message ${type}`;
    messageElement.textContent = text;
    
    // Style the message with translucent background and brighter text
    if (type === 'error') {
      messageElement.style.color = '#ff1a3e'; // Brighter red
      messageElement.style.backgroundColor = 'rgba(225, 82, 112, 0.2)';
      messageElement.style.border = '1px solid rgba(225, 82, 112, 0.3)';
    } else {
      messageElement.style.color = '#00cc44'; // Brighter green
      messageElement.style.backgroundColor = 'rgba(40, 167, 69, 0.2)';
      messageElement.style.border = '1px solid rgba(40, 167, 69, 0.3)';
    }
    
    // General styling for the message
    messageElement.style.fontSize = '0.8rem';
    messageElement.style.marginTop = '0.5rem';
    messageElement.style.padding = '0.5rem 0.75rem';
    messageElement.style.borderRadius = '4px';
    messageElement.style.width = '100%';
    
    // Add to container
    messageContainer.appendChild(messageElement);
  }
}

// Register the custom element
customElements.define('footer-component', FooterComponent);