<!DOCTYPE HTML>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="/styles/main.css">
    <link rel="stylesheet" href="/styles/contact.css">
    <title>Document</title>
</head>
<body>
<?php include "./components/navbar.php";
    echo NavigationBar();
?>
<div class="container">
    <h2>Contact Us</h2>
    <p>We're here to help you on your spiritual journey. Reach out to us with any questions.</p>

    <div class="contact-grid">
        <div class="contact-info">
            <h2>Our Information</h2>

            <div class="contact-item">
                <div class="contact-icon">📍</div>
                <div>
                    <strong>Address</strong>
                    <p>123 Serenity Path, Peace Valley, PV 12345</p>
                </div>
            </div>

            <div class="contact-item">
                <div class="contact-icon">📞</div>
                <div>
                    <strong>Phone</strong>
                    <p>+1 (555) 123-4567</p>
                </div>
            </div>

            <div class="contact-item">
                <div class="contact-icon">✉️</div>
                <div>
                    <strong>Email</strong>
                    <p>info@shanthiashram.com</p>
                </div>
            </div>

            <div class="contact-item">
                <div class="contact-icon">⏰</div>
                <div>
                    <strong>Hours</strong>
                    <p>Daily: 5:00 AM - 9:00 PM</p>
                </div>
            </div>

            <div class="map">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.040998284503!2d79.15335867587224!3d12.96922841492868!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bad479f0ccbe067%3A0xfef222e5f36ecdeb!2sVellore%20Institute%20of%20Technology!5e0!3m2!1sen!2sin!4v1740922567673!5m2!1sen!2sin" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
            </div>
        </div>

        <div class="contact-form">
            <h2>Send Us a Message</h2>
            <form>
                <div class="form-group">
                    <label for="name">Full Name</label>
                    <input type="text" id="name" placeholder="Your name" required>
                </div>

                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" placeholder="Your email" required>
                </div>

                <div class="form-group">
                    <label for="phone">Phone Number</label>
                    <input type="tel" id="phone" placeholder="Your phone number">
                </div>

                <div class="form-group">
                    <label for="inquiry">Inquiry Type</label>
                    <select id="inquiry">
                        <option value="general">General Information</option>
                        <option value="program">Program Inquiry</option>
                        <option value="retreat">Retreat Booking</option>
                        <option value="meditation">Meditation Classes</option>
                        <option value="volunteer">Volunteering</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="message">Your Message</label>
                    <textarea id="message" placeholder="Please enter your message here..." required></textarea>
                </div>

                <button id="contact" type="submit">Send Message</button>
            </form>
        </div>
    </div>
</div>
<?php include "./components/footer.php";
    echo Footer();
    ?>
</body>
</html>
