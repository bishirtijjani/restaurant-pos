import React from "react";

const Footer = () => {
  return (
    <footer className="footer p-10 bg-base-200 text-base-content border-t-4 mt-3 border-base-800">
      <div>
        <span className="footer-title">Services</span>
        <a href="#" className="link link-hover">
          Link
        </a>
        <a href="#" className="link link-hover">
          Link
        </a>
        <a href="#" className="link link-hover">
          AGAIN Link
        </a>
      </div>
      <div>
        <span className="footer-title">Company</span>
        <a href="#" className="link link-hover">
          About us
        </a>
        <a href="#" className="link link-hover">
          Contact
        </a>
      </div>
      <div>
        <span className="footer-title">Follow Us</span>
        <a href="#" className="link link-hover">
          Twitter
        </a>
        <a href="#" className="link link-hover">
          Facebook
        </a>
        <a href="#" className="link link-hover">
          Instagram
        </a>
      </div>
    </footer>
  );
};

export default Footer;
