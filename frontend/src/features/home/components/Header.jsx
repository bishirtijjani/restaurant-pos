// frontend/src/features/home/components/Header.jsx
import React, { useState, useEffect } from "react";
import { Menu, X, MoonIcon, SunIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { themeChange } from "theme-change";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(
    localStorage.getItem("theme")
  );

  useEffect(() => {
    themeChange(false);
    if (currentTheme === null) {
      if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        setCurrentTheme("dark");
      } else {
        setCurrentTheme("light");
      }
    }
  }, []);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    setCurrentTheme(theme);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="bg-base-100/95 backdrop-blur-lg border-b border-base-content/10 sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src="/codeket-restaurant.png"
              className="w-12 h-12 text-white"
              alt="Codeket Restaurant Logo"
            />
            <span className="text-2xl font-bold text-base-content">
              Codeket<span className="text-primary">Restaurant</span>
            </span>
          </div>
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <a
              href="#features"
              className="text-base-content hover:text-primary transition-colors duration-200"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-base-content hover:text-primary transition-colors duration-200"
            >
              Pricing
            </a>
            <a
              href="https://docs.restaurant.codeket.com"
              className="text-base-content hover:text-primary transition-colors duration-200"
            >
              Help Docs
            </a>
            <a
              href="#"
              className="text-base-content hover:text-primary transition-colors duration-200"
            >
              Support
            </a>
          </nav>
          {/* Desktop: Theme Toggle and CTA Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Light and dark theme selection toggle */}
            <label className="swap swap-rotate">
              <input type="checkbox" className="theme-controller" />
              <SunIcon
                data-set-theme="light"
                data-act-class="ACTIVECLASS"
                className="swap-off fill-current w-6 h-6"
              />
              <MoonIcon
                data-set-theme="dark"
                data-act-class="ACTIVECLASS"
                className="swap-on fill-current w-6 h-6"
              />
            </label>

            <Link
              to="/login"
              className="text-base-content hover:text-primary transition-colors duration-200"
            >
              Sign In
            </Link>

            <Link to="/register">
              <button className="btn btn-primary">Start Free Trial</button>
            </Link>
          </div>
          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="lg:hidden p-2 text-base-content hover:text-primary transition-colors duration-200"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-base-content/10 py-4">
            <div className="space-y-4">
              <a
                href="#features"
                className="block py-2 text-base-content hover:text-primary transition-colors duration-200"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="block py-2 text-base-content hover:text-primary transition-colors duration-200"
              >
                Pricing
              </a>
              <a
                href="https://docs.restaurant.codeket.com"
                className="block py-2 text-base-content hover:text-primary transition-colors duration-200"
              >
                Help Docs
              </a>
              <a
                href="#"
                className="block py-2 text-base-content hover:text-primary transition-colors duration-200"
              >
                Support
              </a>
              <div className="pt-4 border-t border-base-content/10 space-y-2">
                {/* Mobile: Theme Toggle */}
                <div className="flex items-center justify-between py-2">
                  <span className="text-base-content">Theme</span>
                  <label className="swap swap-rotate">
                    <input type="checkbox" className="theme-controller" />
                    <SunIcon
                      data-set-theme="light"
                      data-act-class="ACTIVECLASS"
                      className="swap-off fill-current w-6 h-6"
                    />
                    <MoonIcon
                      data-set-theme="dark"
                      data-act-class="ACTIVECLASS"
                      className="swap-on fill-current w-6 h-6"
                    />
                  </label>
                </div>

                <Link
                  to="/login"
                  className="block w-full text-center py-2 text-base-content hover:text-primary transition-colors duration-200"
                >
                  Sign In
                </Link>
                <button className="btn btn-primary w-full">
                  Start Free Trial
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
