import React from 'react';
import './Footer.css';
import { useTranslation } from 'react-i18next';
import { Linkedin } from 'lucide-react';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="global-footer">
      <div className="footer-container">
        
        {/* Brand Section */}
        <div className="footer-brand-section">
          <div className="footer-brand" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '20px', fontWeight: 'bold' }}>SehatLink</span>
          </div>
          <p className="footer-description" style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>
            Bridging the gap in healthcare accessibility. Connecting patients to trusted doctors and local pharmacies anywhere, anytime.
          </p>
          <div className="social-links" style={{ display: 'flex', gap: '16px' }}>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={{ color: '#a1a1aa', transition: 'color 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.color = '#0ea5e9'} onMouseOut={(e) => e.currentTarget.style.color = '#a1a1aa'}>
              <Linkedin size={24} />
            </a>
          </div>
        </div>

        {/* Links Grid */}
        <div className="footer-links-grid">
          
          <div className="footer-column">
            <h4>Resources</h4>
            <ul>
              <li><a href="#">Symptom Checker</a></li>
              <li><a href="#">Health Articles</a></li>
              <li><a href="#">Find a Pharmacy</a></li>
              <li><a href="#">Emergency Care</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Company</h4>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Our Team</a></li>
              <li><a href="#">Contact Support</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Legal</h4>
            <ul>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Doctor Guidelines</a></li>
              <li><a href="#">Cookie Policy</a></li>
            </ul>
          </div>

        </div>

        {/* Newsletter Section */}
        <div className="footer-newsletter">
          <h4>Subscribe to our newsletter</h4>
          <p>Stay updated on new health features and rural deployment progress.</p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="you@domain.com" required />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} SehatLink. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
