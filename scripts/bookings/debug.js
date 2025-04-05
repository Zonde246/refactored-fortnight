// Debugging
console.log("Script loading...");

// Check if roomsData exists
if (typeof roomsData !== 'undefined') {
  console.log("Room data found:", roomsData.length, "rooms");
} else {
  console.error("Room data is undefined! Check if rooms-data.js is loaded correctly.");
}

// DOM elements - add error handling
const roomsContainer = document.getElementById('roomsContainer');
if (!roomsContainer) {
  console.error("Could not find element with ID 'roomsContainer'");
}

// Generate room cards from data - with error handling
function generateRoomCards() {
  console.log("Generating room cards...");
  
  if (!roomsContainer) {
    console.error("Cannot generate room cards: roomsContainer is null");
    return;
  }
  
  if (!roomsData || !Array.isArray(roomsData) || roomsData.length === 0) {
    console.error("Cannot generate room cards: roomsData is invalid", roomsData);
    roomsContainer.innerHTML = '<p>Error loading room data. Please try again later.</p>';
    return;
  }
  
  roomsContainer.innerHTML = '';
  
  try {
    roomsData.forEach((room, index) => {
      console.log(`Processing room ${index + 1}:`, room.title);
      
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
            ${room.features.map((feature, index) => 
              `<span class="feature">${index > 0 ? '• ' : ''}${feature}</span>`
            ).join('')}
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
        console.log("Book button clicked for room:", roomId);
        openBookingModal(roomId);
      });
    });
    
    console.log("Room cards generated successfully!");
  } catch (error) {
    console.error("Error generating room cards:", error);
    roomsContainer.innerHTML = '<p>Error generating room displays. Please try again later.</p>';
  }
}

// Ensure the page is fully loaded before running initialization
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM fully loaded");
  
  try {
    generateRoomCards();
    console.log("Room cards generation called");
    
    // Check if rooms were actually added
    setTimeout(() => {
      const roomCards = document.querySelectorAll('.room-card');
      console.log(`Found ${roomCards.length} room cards in the DOM`);
      
      if (roomCards.length === 0) {
        console.warn("No room cards were created - possible rendering issue");
      }
    }, 500);
    
  } catch (error) {
    console.error("Error during initialization:", error);
  }
});

// Direct initialization - alternative approach if DOMContentLoaded has issues
console.log("Attempting direct initialization");
setTimeout(() => {
  if (document.readyState === "complete" || document.readyState === "interactive") {
    console.log("Document ready state:", document.readyState);
    
    const roomCards = document.querySelectorAll('.room-card');
    if (roomCards.length === 0) {
      console.log("No room cards found, trying to generate them directly");
      try {
        generateRoomCards();
      } catch (error) {
        console.error("Error during direct initialization:", error);
      }
    }
  }
}, 1000);