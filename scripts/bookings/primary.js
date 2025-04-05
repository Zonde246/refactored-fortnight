// DOM elements
const roomsContainer = document.getElementById('roomsContainer');
const bookingModal = document.getElementById('bookingModal');
const closeModalBtn = document.getElementById('closeModal');
const roomTypeSelect = document.getElementById('room-type');
const bookingForm = document.getElementById('bookingForm');
const selectedRoomIdField = document.getElementById('selected-room-id');

let roomsData = []; // Will be populated from the database via API

// Fetch rooms data from API
async function fetchRoomsData() {
  try {
    const response = await fetch('/api/rooms.php');
    if (!response.ok) {
      throw new Error('Failed to fetch rooms data');
    }
    const data = await response.json();
    if (data.success) {
      roomsData = data.data;
      // After fetching, generate room cards
      generateRoomCards();
      // Populate room dropdown options
      populateRoomOptions();
    } else {
      console.error('Error fetching rooms:', data.message);
      // Fallback to dummy data if API fails
      useDummyData();
    }
  } catch (error) {
    console.error('Error:', error);
    // Fallback to dummy data if API fails
    useDummyData();
  }
}

// Fallback to dummy data if API fails
function useDummyData() {
  console.log("Using dummy room data");
  roomsData = [
    {
      id: "standard-single",
      title: "Standard Single Room",
      description: "A simple, peaceful space designed for solitary reflection and meditation.",
      features: ["1 Person", "Shared Bathroom"],
      price: 1200,
      currency: "₹",
      image: "/api/placeholder/300/200",
      maxGuests: 1
    },
    {
      id: "standard-double",
      title: "Standard Double Room",
      description: "Comfortable accommodation for two, perfect for friends or couples on a spiritual journey.",
      features: ["2 People", "Shared Bathroom"],
      price: 1800,
      currency: "₹",
      image: "/api/placeholder/300/200",
      maxGuests: 2
    },
    {
      id: "deluxe-single",
      title: "Deluxe Single Room",
      description: "Enhanced comfort with private facilities for a deeper retreat experience.",
      features: ["1 Person", "Private Bathroom"],
      price: 2200,
      currency: "₹",
      image: "/api/placeholder/300/200",
      maxGuests: 1
    },
    {
      id: "deluxe-double",
      title: "Deluxe Double Room",
      description: "Spacious accommodation with private facilities for two people seeking comfort and tranquility.",
      features: ["2 People", "Private Bathroom"],
      price: 2800,
      currency: "₹",
      image: "/api/placeholder/300/200",
      maxGuests: 2
    },
    {
      id: "dormitory",
      title: "Dormitory",
      description: "Simple, shared accommodation fostering community and connection among spiritual seekers.",
      features: ["6-8 People", "Shared Bathroom"],
      price: 800,
      currency: "₹",
      priceNote: "per person",
      image: "/api/placeholder/300/200",
      maxGuests: 8
    },
    {
      id: "guru-suite",
      title: "Guru Suite",
      description: "Our premium accommodation offering the ultimate space for deep meditation and spiritual work.",
      features: ["2-3 People", "Private Bathroom"],
      price: 3500,
      currency: "₹",
      image: "/api/placeholder/300/200",
      maxGuests: 3
    }
  ];
  
  generateRoomCards();
  populateRoomOptions();
}

// Generate room cards from data
function generateRoomCards() {
  roomsContainer.innerHTML = '';
  
  roomsData.forEach(room => {
    const priceDisplay = room.priceNote 
      ? `${room.currency}${room.price} ${room.priceNote} / night`
      : `${room.currency}${room.price} / night`;
      
    const roomCard = document.createElement('div');
    roomCard.className = 'room-card';
    roomCard.innerHTML = `
      <div class="room-image">
        <img src="${room.image}" alt="${room.title}">
      </div>
      <div class="room-details">
        <h3 class="room-title">${room.title}</h3>
        <p class="room-description">${room.description}</p>
        <div class="room-features">
          ${Array.isArray(room.features) 
            ? room.features.map((feature, index) => `<span class="feature">${index > 0 ? '• ' : ''}${feature}</span>`).join('')
            : typeof room.features === 'string' 
              ? `<span class="feature">${room.features}</span>` 
              : ''}
        </div>
        <div class="price">${priceDisplay}</div>
        <button class="book-button" data-room-id="${room.id}">Book Now</button>
      </div>
    `;
    roomsContainer.appendChild(roomCard);
  });

  // Add event listeners to all book buttons
  document.querySelectorAll('.book-button').forEach(button => {
    button.addEventListener('click', function() {
      const roomId = this.getAttribute('data-room-id');
      openBookingModal(roomId);
    });
  });
}

// Populate room select options
function populateRoomOptions() {
  roomTypeSelect.innerHTML = '<option value="">Select a room type</option>';
  roomsData.forEach(room => {
    const option = document.createElement('option');
    option.value = room.id;
    option.textContent = room.title;
    roomTypeSelect.appendChild(option);
  });
}

// Check room availability via API
async function checkRoomAvailability(roomId, checkIn, checkOut, guests) {
  try {
    const url = `/api/booking.php?action=check_availability&room_id=${encodeURIComponent(roomId)}&check_in=${encodeURIComponent(checkIn)}&check_out=${encodeURIComponent(checkOut)}&guests=${encodeURIComponent(guests)}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking availability:', error);
    return { success: false, message: 'Failed to check availability' };
  }
}

// Calculate total price for the stay
function calculateTotalPrice(roomId, checkIn, checkOut, guests) {
  const room = roomsData.find(r => r.id === roomId);
  if (!room) return 0;
  
  // Calculate number of nights
  const startDate = new Date(checkIn);
  const endDate = new Date(checkOut);
  const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  
  // Calculate price
  let totalPrice = room.price * nights;
  
  // For dormitory, multiply by number of guests
  if (roomId === 'dormitory') {
    totalPrice *= guests;
  }
  
  return totalPrice;
}

// Display booking summary
function updateBookingSummary() {
  const roomId = selectedRoomIdField.value;
  const checkIn = document.getElementById('check-in').value;
  const checkOut = document.getElementById('check-out').value;
  const guests = parseInt(document.getElementById('guests').value) || 1;
  
  // Check if we have all required values
  if (!roomId || !checkIn || !checkOut) return;
  
  const room = roomsData.find(r => r.id === roomId);
  if (!room) return;
  
  // Calculate nights
  const startDate = new Date(checkIn);
  const endDate = new Date(checkOut);
  const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  
  // Calculate total price
  const totalPrice = calculateTotalPrice(roomId, checkIn, checkOut, guests);
  
  // Get or create summary element
  let summaryElement = document.getElementById('booking-summary');
  if (!summaryElement) {
    summaryElement = document.createElement('div');
    summaryElement.id = 'booking-summary';
    summaryElement.className = 'booking-summary';
    document.querySelector('.booking-form').appendChild(summaryElement, document.querySelector('.form-group.form-checkbox'));
  }
  
  // Format dates
  const checkInFormatted = new Date(checkIn).toLocaleDateString();
  const checkOutFormatted = new Date(checkOut).toLocaleDateString();
  
  // Update summary content
  summaryElement.innerHTML = `
    <h3>Booking Summary</h3>
    <div class="summary-item">
      <span>Room:</span>
      <span>${room.title}</span>
    </div>
    <div class="summary-item">
      <span>Check-in:</span>
      <span>${checkInFormatted}</span>
    </div>
    <div class="summary-item">
      <span>Check-out:</span>
      <span>${checkOutFormatted}</span>
    </div>
    <div class="summary-item">
      <span>Nights:</span>
      <span>${nights}</span>
    </div>
    <div class="summary-item">
      <span>Guests:</span>
      <span>${guests}</span>
    </div>
    <div class="summary-item total">
      <span>Total Price:</span>
      <span>${room.currency}${totalPrice}</span>
    </div>
  `;
}

// Open booking modal with specific room selected
async function openBookingModal(roomId) {
  // Reset form and validation
  resetForm();
  
  // Set minimum date for check-in to today
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  document.getElementById('check-in').min = todayString;
  
  // Set default value for check-in to today
  document.getElementById('check-in').value = todayString;
  
  // Set default check-out to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowString = tomorrow.toISOString().split('T')[0];
  document.getElementById('check-out').value = tomorrowString;
  document.getElementById('check-out').min = tomorrowString;
  
  // Set the selected room
  selectedRoomIdField.value = roomId;
  roomTypeSelect.value = roomId;
  
  // Set default number of guests based on room
  const selectedRoom = roomsData.find(room => room.id === roomId);
  const guestsSelect = document.getElementById('guests');
  
  // Reset options
  guestsSelect.innerHTML = '<option value="">Select</option>';
  
  // Add appropriate number of options
  for (let i = 1; i <= selectedRoom.maxGuests; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    guestsSelect.appendChild(option);
  }
  
  // Default to 1 guest
  guestsSelect.value = "1";
  
  // Check room availability for selected dates
  const availabilityResult = await checkRoomAvailability(
    roomId, 
    document.getElementById('check-in').value,
    document.getElementById('check-out').value,
    1 // Default to 1 guest initially
  );
  
  // If not available, show message
  if (availabilityResult.success && !availabilityResult.data.available) {
    alert(`This room is not available for the selected dates: ${availabilityResult.data.message}`);
    return;
  }
  
  // Update booking summary
  updateBookingSummary();
  
  // Check if user is logged in
  checkUserLoginStatus();
  
  // Show the modal
  bookingModal.style.display = 'flex';
  
  // Prevent body scrolling when modal is open
  document.body.style.overflow = 'hidden';
  
  // For mobile: scroll to top of modal
  setTimeout(() => {
    document.querySelector('.modal-content').scrollTop = 0;
  }, 100);
}

// Check if user is logged in and pre-fill form fields
async function checkUserLoginStatus() {
  try {
    const response = await fetch('/api/user.php');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    if (data.success && data.data.logged_in) {
      // User is logged in, pre-fill form
      const user = data.data.user;
      document.getElementById('full-name').value = user.name || '';
      document.getElementById('email').value = user.email || '';
      
      // If we have additional user info
      if (user.phone) document.getElementById('phone').value = user.phone;
      if (user.country) document.getElementById('country').value = user.country;
      
      // Show logged-in status
      const formTitle = document.querySelector('.booking-form .form-title');
      const loginStatus = document.createElement('div');
      loginStatus.className = 'login-status';
      loginStatus.innerHTML = `<p>Logged in as <strong>${user.email}</strong></p>`;
      formTitle.parentNode.insertBefore(loginStatus, formTitle.nextSibling);
    }
  } catch (error) {
    console.error('Error checking login status:', error);
    // Continue without pre-filled data
  }
}

// Close modal function
function closeModal() {
  bookingModal.style.display = 'none';
  document.body.style.overflow = 'auto';
  resetForm();
}

// Reset form and errors
function resetForm() {
  bookingForm.reset();
  
  // Clear all error messages
  document.querySelectorAll('.error-message').forEach(element => {
    element.textContent = '';
  });
  
  // Remove error classes
  document.querySelectorAll('.error').forEach(element => {
    element.classList.remove('error');
  });
  
  // Remove success message if exists
  const successMessage = document.querySelector('.success-message');
  if (successMessage) {
    successMessage.remove();
  }
  
  // Remove login status if exists
  const loginStatus = document.querySelector('.login-status');
  if (loginStatus) {
    loginStatus.remove();
  }
  
  // Remove booking summary if exists
  const bookingSummary = document.getElementById('booking-summary');
  if (bookingSummary) {
    bookingSummary.remove();
  }
}

// Validate form
function validateForm() {
  let isValid = true;
  const formElements = bookingForm.elements;
  
  // Check each required field
  for (let i = 0; i < formElements.length; i++) {
    const element = formElements[i];
    
    // Skip elements that don't need validation
    if (!element.hasAttribute('required') || element.type === 'hidden') {
      continue;
    }
    
    const errorElement = document.getElementById(`${element.id}-error`);
    
    // Reset previous errors
    element.classList.remove('error');
    if (errorElement) errorElement.textContent = '';
    
    // Check for empty fields
    if (!element.value.trim()) {
      element.classList.add('error');
      if (errorElement) errorElement.textContent = 'This field is required';
      isValid = false;
    } 
    // Special validation for email
    else if (element.type === 'email' && !validateEmail(element.value)) {
      element.classList.add('error');
      if (errorElement) errorElement.textContent = 'Please enter a valid email address';
      isValid = false;
    }
    // Special validation for phone
    else if (element.id === 'phone' && !validatePhone(element.value)) {
      element.classList.add('error');
      if (errorElement) errorElement.textContent = 'Please enter a valid phone number';
      isValid = false;
    }
    // Check that check-out is after check-in
    else if (element.id === 'check-out') {
      const checkIn = document.getElementById('check-in').value;
      if (new Date(element.value) <= new Date(checkIn)) {
        element.classList.add('error');
        if (errorElement) errorElement.textContent = 'Check-out date must be after check-in date';
        isValid = false;
      }
    }
  }
  
  return isValid;
}

// Email validation
function validateEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

// Phone validation (basic international format)
function validatePhone(phone) {
  // Allow digits, spaces, parentheses, hyphens, and plus sign
  // Must have at least 7 digits total
  const re = /^[+]?[\s()0-9-]{7,}$/;
  return re.test(String(phone));
}

// Submit booking via API
async function submitBooking(formData) {
  try {
    const response = await fetch('/api/booking.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error submitting booking:', error);
    return { success: false, message: 'Failed to submit booking' };
  }
}

// Handle window resize for mobile
function adjustModalForMobile() {
  if (window.innerWidth < 768) {
    // Mobile adjustments
    document.querySelector('.modal-content').style.maxHeight = '90vh';
  } else {
    // Desktop
    document.querySelector('.modal-content').style.maxHeight = '80vh';
  }
}

// Event listeners
closeModalBtn.addEventListener('click', closeModal);

// Close modal if clicked outside content
bookingModal.addEventListener('click', function(event) {
  if (event.target === bookingModal) {
    closeModal();
  }
});

// Update booking summary and check availability when dates or guests change
document.getElementById('check-in').addEventListener('change', async function() {
  await updateAvailability();
  updateBookingSummary();
});

document.getElementById('check-out').addEventListener('change', async function() {
  await updateAvailability();
  updateBookingSummary();
});

document.getElementById('guests').addEventListener('change', async function() {
  await updateAvailability();
  updateBookingSummary();
});

// Update availability status
async function updateAvailability() {
  const roomId = selectedRoomIdField.value;
  const checkIn = document.getElementById('check-in').value;
  const checkOut = document.getElementById('check-out').value;
  const guests = document.getElementById('guests').value;
  
  // Only check if all values are present
  if (!roomId || !checkIn || !checkOut || !guests) {
    return;
  }
  
  const result = await checkRoomAvailability(roomId, checkIn, checkOut, guests);
  
  // Show availability message
  const errorElement = document.getElementById('room-type-error');
  if (errorElement) {
    if (result.success) {
      if (result.data.available) {
        errorElement.textContent = 'Room available for selected dates';
        errorElement.className = 'success-message';
        
        // If it's a dormitory, show available space
        if (result.data.available_space !== null) {
          errorElement.textContent += ` (${result.data.available_space} spots remaining)`;
        }
      } else {
        errorElement.textContent = result.data.message;
        errorElement.className = 'error-message';
      }
    } else {
      errorElement.textContent = result.message || 'Failed to check availability';
      errorElement.className = 'error-message';
    }
  }
}

// Form validation on input to provide immediate feedback
bookingForm.addEventListener('input', function(event) {
  // Only validate fields that have already been interacted with
  if (event.target.hasAttribute('required')) {
    const element = event.target;
    const errorElement = document.getElementById(`${element.id}-error`);
    
    // Reset previous errors
    element.classList.remove('error');
    if (errorElement) errorElement.textContent = '';
    
    // Special validation based on field type
    if (!element.value.trim()) {
      element.classList.add('error');
      if (errorElement) errorElement.textContent = 'This field is required';
    } else if (element.type === 'email' && !validateEmail(element.value)) {
      element.classList.add('error');
      if (errorElement) errorElement.textContent = 'Please enter a valid email address';
    } else if (element.id === 'phone' && !validatePhone(element.value)) {
      element.classList.add('error');
      if (errorElement) errorElement.textContent = 'Please enter a valid phone number';
    } else if (element.id === 'check-out') {
      const checkIn = document.getElementById('check-in').value;
      if (new Date(element.value) <= new Date(checkIn)) {
        element.classList.add('error');
        if (errorElement) errorElement.textContent = 'Check-out date must be after check-in date';
      }
    }
  }
});

// Form submission with validation
bookingForm.addEventListener('submit', async function(event) {
  event.preventDefault();
  
  if (validateForm()) {
    // Collect form data
    const formData = {
      room_id: selectedRoomIdField.value,
      check_in: document.getElementById('check-in').value,
      check_out: document.getElementById('check-out').value,
      full_name: document.getElementById('full-name').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      country: document.getElementById('country').value,
      guests: document.getElementById('guests').value,
      special_requests: document.getElementById('special-requests').value
    };
    
    // Check availability one last time before submitting
    const availabilityResult = await checkRoomAvailability(
      formData.room_id, 
      formData.check_in,
      formData.check_out,
      formData.guests
    );
    
    if (!availabilityResult.success || !availabilityResult.data.available) {
      alert(`Sorry, this room is no longer available: ${availabilityResult.data.message}`);
      return;
    }
    
    // Submit booking
    const result = await submitBooking(formData);
    
    if (result.success) {
      // Get the selected room data
      const room = roomsData.find(r => r.id === formData.room_id);
      const guestName = formData.full_name;
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'success-message';
      successMessage.innerHTML = `
        <h3>Booking Confirmed!</h3>
        <p>Thank you, ${guestName}! Your booking for ${room.title} has been received.</p>
        <p>Booking Reference: <strong>${result.data.booking_id}</strong></p>
        <p>We will contact you shortly at ${formData.email} to confirm your reservation.</p>
        <p>You can view your booking details in your account dashboard if you're logged in.</p>
      `;
      
      // Insert success message at the top of the form
      const formTitle = document.querySelector('.booking-form .form-title');
      formTitle.parentNode.insertBefore(successMessage, formTitle.nextSibling);
      successMessage.style.display = 'block';
      
      // Hide form
      bookingForm.style.display = 'none';
      
      // Scroll to see success message
      successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Close modal after delay
      setTimeout(() => {
        closeModal();
        // Reset form display
        bookingForm.style.display = 'block';
      }, 5000);
    } else {
      // Show error message
      alert(`Booking failed: ${result.message}`);
    }
  }
});

// Initialize the page when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM loaded - initializing room booking page");
  
  // Fetch rooms data from API
  fetchRoomsData();
  
  // Set today as minimum date for check-in
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('check-in').min = today;
  
  // Handle viewport resizing for mobile
  window.addEventListener('resize', adjustModalForMobile);
  adjustModalForMobile();
});

// Fallback initialization in case DOMContentLoaded already fired
if (document.readyState === "complete" || document.readyState === "interactive") {
  fetchRoomsData();
}