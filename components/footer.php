<?php

function Footer() {

    return '
        <head>
            <link rel="stylesheet" href="/styles/footer.css" />
            <script src="/scripts/components/formHandler.js"></script>
        </head>
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
                        <li><a href="#">About Us</a></li>
                        <li><a href="#">Programs</a></li>
                        <li><a href="#">Schedule</a></li>
                        <li><a href="#">Accommodation</a></li>
                        <li><a href="#">Directions</a></li>
                        <li><a href="#">FAQ</a></li>
                    </ul>
                </div>
        
                <div class="footer-col">
                    <h3>Contact Us</h3>
                    <p>123 Meditation Path<br>Peaceful Valley, SP 12345</p>
                    <p>Name: ZonDe19<br>RegNo: 23BCA0127</p>
                    <p>Name: h00die33<br>RegNo: 23BCA0152</p>
                </div>
        
                <div class="footer-col">
                    <h3>Newsletter</h3>
                    <p>Subscribe to receive updates on events and special offers.</p>
                    <form class="FooterContact-form">
                        <input type="email" placeholder="Your Email">
                        <button class="submit-btn">Subscribe</button>
                    </form>
                </div>
            </div>
            <div class="copyright">
                <p>&copy; 2025 Shanti Ashram. All Rights Reserved.</p>
                <p>Developed by ZonDe19 & Hoodie</p>
            </div>
        </footer>
    ';
}
