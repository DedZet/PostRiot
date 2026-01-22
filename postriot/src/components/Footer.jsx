import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Логотип */}
        <div className="footer-section">
          <Link to="/" className="logo">
            POST RIOT
          </Link>
          <p className="footer-tagline">STREETWEAR & CULTURE</p>
        </div>

        {/* Ссылка на Телеграм */}
        <div className="footer-section">
          {/* ВСТАВЬТЕ ВАШУ ССЫЛКУ В href НИЖЕ */}
          <a 
            href="https://t.me/PostRiot" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="tg-footer-btn"
          >
            TELEGRAM CHANNEL
          </a>
        </div>

        {/* Контакты */}
        <div className="footer-section footer-contacts">
          <span className="contact-label">CONTACT US:</span>
          <span href="tel:+79991234567" className="footer-phone">
            +7 (999) 123-45-67
          </span>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} POST RIOT. ALL RIGHTS RESERVED.</p>
      </div>
    </footer>
  );
}