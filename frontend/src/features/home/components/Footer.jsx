// frontend/src/features/home/components/Footer.jsx
import React from "react";
import {
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Twitter,
  Linkedin,
  Youtube,
  Facebook,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-base-200 to-base-300 border-t border-base-content/10">
      <div className="container mx-auto px-4 lg:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="space-y-4 lg:space-y-6">
            <div className="flex items-center gap-3">
              <img
                src="/codeket-restaurant.png"
                className="w-12 h-12 lg:h-24 lg:w-24 text-white"
              />
              <span className="text-xl lg:text-2xl font-bold text-base-content">
                Codeket<span className="text-primary">Restaurant</span>
              </span>
            </div>
            <p className="text-sm lg:text-base text-base-content/70 leading-relaxed">
              Complete restaurant management system for modern eateries.
              Streamline orders, manage inventory, and delight customers with
              our all-in-one platform.
            </p>
            <div className="flex gap-3 lg:gap-4">
              <a
                href="#"
                className="bg-base-100 p-2 lg:p-3 rounded-xl hover:bg-primary hover:text-white transition-all duration-300"
              >
                <Twitter className="w-4 h-4 lg:w-5 lg:h-5" />
              </a>
              <a
                href="#"
                className="bg-base-100 p-2 lg:p-3 rounded-xl hover:bg-primary hover:text-white transition-all duration-300"
              >
                <Linkedin className="w-4 h-4 lg:w-5 lg:h-5" />
              </a>
              <a
                href="#"
                className="bg-base-100 p-2 lg:p-3 rounded-xl hover:bg-primary hover:text-white transition-all duration-300"
              >
                <Youtube className="w-4 h-4 lg:w-5 lg:h-5" />
              </a>
              <a
                href="#"
                className="bg-base-100 p-2 lg:p-3 rounded-xl hover:bg-primary hover:text-white transition-all duration-300"
              >
                <Facebook className="w-4 h-4 lg:w-5 lg:h-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-4 lg:space-y-6">
            <h4 className="text-base lg:text-lg font-semibold text-base-content">
              Product
            </h4>
            <div className="space-y-2 lg:space-y-3">
              <a
                href="#features"
                className="block text-sm lg:text-base text-base-content/70 hover:text-primary transition-colors duration-200"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="block text-sm lg:text-base text-base-content/70 hover:text-primary transition-colors duration-200"
              >
                Pricing
              </a>
              <a
                href="https://docs.restaurant.codeket.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm lg:text-base text-base-content/70 hover:text-primary transition-colors duration-200"
              >
                Help Docs
              </a>
              <a
                href="#"
                className="block text-sm lg:text-base text-base-content/70 hover:text-primary transition-colors duration-200"
              >
                Mobile App
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div className="space-y-4 lg:space-y-6">
            <h4 className="text-base lg:text-lg font-semibold text-base-content">
              Company
            </h4>
            <div className="space-y-2 lg:space-y-3">
              <a
                href="https://codeket.com/about"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm lg:text-base text-base-content/70 hover:text-primary transition-colors duration-200"
              >
                About Codeket
              </a>
              <a
                href="https://codeket.com/services"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm lg:text-base text-base-content/70 hover:text-primary transition-colors duration-200"
              >
                Our Services
              </a>
              <a
                href="https://codeket.com/contact"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm lg:text-base text-base-content/70 hover:text-primary transition-colors duration-200"
              >
                Contact Us
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4 lg:space-y-6">
            <h4 className="text-base lg:text-lg font-semibold text-base-content">
              Get in Touch
            </h4>
            <div className="space-y-3 lg:space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 lg:w-5 lg:h-5 text-primary flex-shrink-0" />
                <span className="text-sm lg:text-base text-base-content/70 break-all">
                  restaurant@codeket.com
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 lg:w-5 lg:h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm lg:text-base text-base-content/70">
                  +234 906 350 3232
                </span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 lg:w-5 lg:h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm lg:text-base text-base-content/70">
                  New Ring Road, Kwado
                  <br />
                  Katsina, Nigeria 820101
                </span>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="bg-base-100/50 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-base-content/10">
              <h5 className="font-semibold text-sm lg:text-base text-base-content mb-2 lg:mb-3">
                Stay Updated
              </h5>
              <p className="text-xs lg:text-sm text-base-content/70 mb-3 lg:mb-4">
                Get restaurant management tips and product updates.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="input input-bordered input-sm lg:input-md flex-1 text-xs lg:text-sm"
                />
                <button className="btn btn-primary btn-sm lg:btn-md">
                  <ArrowRight className="w-3 h-3 lg:w-4 lg:h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-base-content/10 mt-12 lg:mt-16 pt-6 lg:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-base-content/60 text-xs lg:text-sm text-center md:text-left">
              © 2025 Codeket Ltd. All rights reserved.
            </div>
            <div className="flex flex-wrap justify-center gap-4 lg:gap-6 text-xs lg:text-sm">
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="/privacy-policy"
                className="link text-base-content/60 hover:text-primary transition-colors duration-200"
              >
                Privacy Policy
              </a>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="/terms-of-service"
                className="link text-base-content/60 hover:text-primary transition-colors duration-200"
              >
                Terms of Service
              </a>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="/cookie-policy"
                className="link text-base-content/60 hover:text-primary transition-colors duration-200"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
