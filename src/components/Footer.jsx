import React from "react";
import { FaFacebookF, FaInstagram, FaXTwitter } from "react-icons/fa6";
import "./style/footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-column">
        <h3>Talk2Doc 24/7</h3>
        <ul>
          <li><a href="/about">About us</a></li>
          <li><a href="/interview">Interview</a></li>
          <li><a href="/blog">Blog</a></li>
          <li><a href="/press-kit">Press kit</a></li>
        </ul>
      </div>

      <div className="footer-column">
        <h3>Get in touch</h3>
        <p><a href="mailto:contact@symptomate.com">futurxteam@gmail.com</a></p>
        <div className="social-icons">
          <a href="#"><FaFacebookF /></a>
          <a href="#"><FaXTwitter /></a>
          <a href="#"><FaInstagram /></a>
        </div>
      </div>

      <div className="footer-column">
        <h3>Learn more</h3>
        <p>
          Talk2Doc 24/7 and triage technology powered by{" "}
          <a href="https://futurx.com" target="_blank" rel="noopener noreferrer">
            FutuRx
          </a>
        </p>
        <p>
          For more information, see our{" "}
          <a href="/terms">Terms of service</a>,{" "}
          <a href="/privacy">Privacy Policy</a> and{" "}
          <a href="/cookies">Cookies Policy</a>
        </p>
        <p>FutuRx © {new Date().getFullYear()}</p>
      </div>

      <div className="footer-column">
        <h3>Staff Login</h3>
        
      </div>
    </footer>
  );
}
