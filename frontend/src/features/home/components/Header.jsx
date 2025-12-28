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
            <a href="/">
              <img
                src="/icon.svg"
                className="w-12 h-12 text-white"
                alt="Codeket Restaurant Logo"
              />
            </a>
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
            {/* Theme selector dropdown */}
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle"
              >
                {currentTheme === "dark" ? (
                  <MoonIcon className="w-5 h-5" />
                ) : (
                  <SunIcon className="w-5 h-5" />
                )}
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content z-[60] p-3 shadow-2xl bg-base-100 rounded-box w-[600px] mt-2 grid grid-cols-4 gap-1"
              >
                <li>
                  <button
                    className="btn btn-xs btn-block btn-ghost justify-start px-2 py-2 text-xs"
                    data-set-theme="light"
                  >
                    ☀️ Light
                  </button>
                </li>
                <li>
                  <button
                    className="btn btn-xs btn-block btn-ghost justify-start px-2 py-2 text-xs"
                    data-set-theme="dark"
                  >
                    🌙 Dark
                  </button>
                </li>
                <li>
                  <button
                    className="btn btn-xs btn-block btn-ghost justify-start px-2 py-2 text-xs"
                    data-set-theme="cupcake"
                  >
                    🧁 Cupcake
                  </button>
                </li>
                <li>
                  <button
                    className="btn btn-xs btn-block btn-ghost justify-start px-2 py-2 text-xs"
                    data-set-theme="bumblebee"
                  >
                    🐝 Bumblebee
                  </button>
                </li>
                <li>
                  <button
                    className="btn btn-xs btn-block btn-ghost justify-start px-2 py-2 text-xs"
                    data-set-theme="emerald"
                  >
                    💚 Emerald
                  </button>
                </li>
                <li>
                  <button
                    className="btn btn-xs btn-block btn-ghost justify-start px-2 py-2 text-xs"
                    data-set-theme="corporate"
                  >
                    🏢 Corporate
                  </button>
                </li>
                <li>
                  <button
                    className="btn btn-xs btn-block btn-ghost justify-start px-2 py-2 text-xs"
                    data-set-theme="synthwave"
                  >
                    🌃 Synthwave
                  </button>
                </li>
                <li>
                  <button
                    className="btn btn-xs btn-block btn-ghost justify-start px-2 py-2 text-xs"
                    data-set-theme="retro"
                  >
                    📼 Retro
                  </button>
                </li>
                <li>
                  <button
                    className="btn btn-xs btn-block btn-ghost justify-start px-2 py-2 text-xs"
                    data-set-theme="cyberpunk"
                  >
                    🤖 Cyberpunk
                  </button>
                </li>
                <li>
                  <button
                    className="btn btn-xs btn-block btn-ghost justify-start px-2 py-2 text-xs"
                    data-set-theme="valentine"
                  >
                    💝 Valentine
                  </button>
                </li>
                <li>
                  <button
                    className="btn btn-xs btn-block btn-ghost justify-start px-2 py-2 text-xs"
                    data-set-theme="halloween"
                  >
                    🎃 Halloween
                  </button>
                </li>
                <li>
                  <button
                    className="btn btn-xs btn-block btn-ghost justify-start px-2 py-2 text-xs"
                    data-set-theme="garden"
                  >
                    🌸 Garden
                  </button>
                </li>
                <li>
                  <button
                    className="btn btn-xs btn-block btn-ghost justify-start px-2 py-2 text-xs"
                    data-set-theme="forest"
                  >
                    🌲 Forest
                  </button>
                </li>
                <li>
                  <button
                    className="btn btn-xs btn-block btn-ghost justify-start px-2 py-2 text-xs"
                    data-set-theme="aqua"
                  >
                    🌊 Aqua
                  </button>
                </li>
                <li>
                  <button
                    className="btn btn-xs btn-block btn-ghost justify-start px-2 py-2 text-xs"
                    data-set-theme="lofi"
                  >
                    📻 Lofi
                  </button>
                </li>
                <li>
                  <button
                    className="btn btn-xs btn-block btn-ghost justify-start px-2 py-2 text-xs"
                    data-set-theme="pastel"
                  >
                    🎨 Pastel
                  </button>
                </li>
                <li>
                  <button
                    className="btn btn-xs btn-block btn-ghost justify-start px-2 py-2 text-xs"
                    data-set-theme="fantasy"
                  >
                    🧚 Fantasy
                  </button>
                </li>
                <li>
                  <button
                    className="btn btn-xs btn-block btn-ghost justify-start px-2 py-2 text-xs"
                    data-set-theme="wireframe"
                  >
                    📐 Wireframe
                  </button>
                </li>
                <li>
                  <button
                    className="btn btn-xs btn-block btn-ghost justify-start px-2 py-2 text-xs"
                    data-set-theme="black"
                  >
                    ⚫ Black
                  </button>
                </li>
                <li>
                  <button
                    className="btn btn-xs btn-block btn-ghost justify-start px-2 py-2 text-xs"
                    data-set-theme="luxury"
                  >
                    💎 Luxury
                  </button>
                </li>
                <li>
                  <button
                    className="btn btn-xs btn-block btn-ghost justify-start px-2 py-2 text-xs"
                    data-set-theme="dracula"
                  >
                    🧛 Dracula
                  </button>
                </li>
                <li>
                  <button
                    className="btn btn-xs btn-block btn-ghost justify-start px-2 py-2 text-xs"
                    data-set-theme="cmyk"
                  >
                    🖨️ CMYK
                  </button>
                </li>
                <li>
                  <button
                    className="btn btn-xs btn-block btn-ghost justify-start px-2 py-2 text-xs"
                    data-set-theme="autumn"
                  >
                    🍂 Autumn
                  </button>
                </li>
                <li>
                  <button
                    className="btn btn-xs btn-block btn-ghost justify-start px-2 py-2 text-xs"
                    data-set-theme="business"
                  >
                    💼 Business
                  </button>
                </li>
                <li>
                  <button
                    className="btn btn-xs btn-block btn-ghost justify-start px-2 py-2 text-xs"
                    data-set-theme="acid"
                  >
                    🧪 Acid
                  </button>
                </li>
                <li>
                  <button
                    className="btn btn-xs btn-block btn-ghost justify-start px-2 py-2 text-xs"
                    data-set-theme="lemonade"
                  >
                    🍋 Lemonade
                  </button>
                </li>
                <li>
                  <button
                    className="btn btn-xs btn-block btn-ghost justify-start px-2 py-2 text-xs"
                    data-set-theme="night"
                  >
                    🌃 Night
                  </button>
                </li>
                <li>
                  <button
                    className="btn btn-xs btn-block btn-ghost justify-start px-2 py-2 text-xs"
                    data-set-theme="coffee"
                  >
                    ☕ Coffee
                  </button>
                </li>
                <li>
                  <button
                    className="btn btn-xs btn-block btn-ghost justify-start px-2 py-2 text-xs"
                    data-set-theme="winter"
                  >
                    ❄️ Winter
                  </button>
                </li>
                <li>
                  <button
                    className="btn btn-xs btn-block btn-ghost justify-start px-2 py-2 text-xs"
                    data-set-theme="dim"
                  >
                    🔅 Dim
                  </button>
                </li>
                <li>
                  <button
                    className="btn btn-xs btn-block btn-ghost justify-start px-2 py-2 text-xs"
                    data-set-theme="nord"
                  >
                    🏔️ Nord
                  </button>
                </li>
                <li>
                  <button
                    className="btn btn-xs btn-block btn-ghost justify-start px-2 py-2 text-xs"
                    data-set-theme="sunset"
                  >
                    🌅 Sunset
                  </button>
                </li>
              </ul>
            </div>

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
                {/* Mobile: Theme Selector */}
                <div className="py-2">
                  <span className="text-base-content block mb-2">Theme</span>
                  <div className="dropdown dropdown-end w-full">
                    <div
                      tabIndex={0}
                      role="button"
                      className="btn btn-ghost btn-block justify-start"
                    >
                      {currentTheme === "dark" ? (
                        <>
                          <MoonIcon className="w-5 h-5 mr-2" />
                          <span className="capitalize">
                            {currentTheme || "Select Theme"}
                          </span>
                        </>
                      ) : (
                        <>
                          <SunIcon className="w-5 h-5 mr-2" />
                          <span className="capitalize">
                            {currentTheme || "Select Theme"}
                          </span>
                        </>
                      )}
                    </div>
                    <ul
                      tabIndex={0}
                      className="dropdown-content z-[1] p-2 shadow-2xl bg-base-300 rounded-box w-full max-h-96 overflow-y-auto"
                    >
                      <li>
                        <button
                          className="btn btn-sm btn-block btn-ghost justify-start"
                          data-set-theme="light"
                        >
                          ☀️ Light
                        </button>
                      </li>
                      <li>
                        <button
                          className="btn btn-sm btn-block btn-ghost justify-start"
                          data-set-theme="dark"
                        >
                          🌙 Dark
                        </button>
                      </li>
                      <li>
                        <button
                          className="btn btn-sm btn-block btn-ghost justify-start"
                          data-set-theme="cupcake"
                        >
                          🧁 Cupcake
                        </button>
                      </li>
                      <li>
                        <button
                          className="btn btn-sm btn-block btn-ghost justify-start"
                          data-set-theme="bumblebee"
                        >
                          🐝 Bumblebee
                        </button>
                      </li>
                      <li>
                        <button
                          className="btn btn-sm btn-block btn-ghost justify-start"
                          data-set-theme="emerald"
                        >
                          💚 Emerald
                        </button>
                      </li>
                      <li>
                        <button
                          className="btn btn-sm btn-block btn-ghost justify-start"
                          data-set-theme="corporate"
                        >
                          🏢 Corporate
                        </button>
                      </li>
                      <li>
                        <button
                          className="btn btn-sm btn-block btn-ghost justify-start"
                          data-set-theme="synthwave"
                        >
                          🌃 Synthwave
                        </button>
                      </li>
                      <li>
                        <button
                          className="btn btn-sm btn-block btn-ghost justify-start"
                          data-set-theme="retro"
                        >
                          📼 Retro
                        </button>
                      </li>
                      <li>
                        <button
                          className="btn btn-sm btn-block btn-ghost justify-start"
                          data-set-theme="cyberpunk"
                        >
                          🤖 Cyberpunk
                        </button>
                      </li>
                      <li>
                        <button
                          className="btn btn-sm btn-block btn-ghost justify-start"
                          data-set-theme="valentine"
                        >
                          💝 Valentine
                        </button>
                      </li>
                      <li>
                        <button
                          className="btn btn-sm btn-block btn-ghost justify-start"
                          data-set-theme="halloween"
                        >
                          🎃 Halloween
                        </button>
                      </li>
                      <li>
                        <button
                          className="btn btn-sm btn-block btn-ghost justify-start"
                          data-set-theme="garden"
                        >
                          🌸 Garden
                        </button>
                      </li>
                      <li>
                        <button
                          className="btn btn-sm btn-block btn-ghost justify-start"
                          data-set-theme="forest"
                        >
                          🌲 Forest
                        </button>
                      </li>
                      <li>
                        <button
                          className="btn btn-sm btn-block btn-ghost justify-start"
                          data-set-theme="aqua"
                        >
                          🌊 Aqua
                        </button>
                      </li>
                      <li>
                        <button
                          className="btn btn-sm btn-block btn-ghost justify-start"
                          data-set-theme="lofi"
                        >
                          📻 Lofi
                        </button>
                      </li>
                      <li>
                        <button
                          className="btn btn-sm btn-block btn-ghost justify-start"
                          data-set-theme="pastel"
                        >
                          🎨 Pastel
                        </button>
                      </li>
                      <li>
                        <button
                          className="btn btn-sm btn-block btn-ghost justify-start"
                          data-set-theme="fantasy"
                        >
                          🧚 Fantasy
                        </button>
                      </li>
                      <li>
                        <button
                          className="btn btn-sm btn-block btn-ghost justify-start"
                          data-set-theme="wireframe"
                        >
                          📐 Wireframe
                        </button>
                      </li>
                      <li>
                        <button
                          className="btn btn-sm btn-block btn-ghost justify-start"
                          data-set-theme="black"
                        >
                          ⚫ Black
                        </button>
                      </li>
                      <li>
                        <button
                          className="btn btn-sm btn-block btn-ghost justify-start"
                          data-set-theme="luxury"
                        >
                          💎 Luxury
                        </button>
                      </li>
                      <li>
                        <button
                          className="btn btn-sm btn-block btn-ghost justify-start"
                          data-set-theme="dracula"
                        >
                          🧛 Dracula
                        </button>
                      </li>
                      <li>
                        <button
                          className="btn btn-sm btn-block btn-ghost justify-start"
                          data-set-theme="cmyk"
                        >
                          🖨️ CMYK
                        </button>
                      </li>
                      <li>
                        <button
                          className="btn btn-sm btn-block btn-ghost justify-start"
                          data-set-theme="autumn"
                        >
                          🍂 Autumn
                        </button>
                      </li>
                      <li>
                        <button
                          className="btn btn-sm btn-block btn-ghost justify-start"
                          data-set-theme="business"
                        >
                          💼 Business
                        </button>
                      </li>
                      <li>
                        <button
                          className="btn btn-sm btn-block btn-ghost justify-start"
                          data-set-theme="acid"
                        >
                          🧪 Acid
                        </button>
                      </li>
                      <li>
                        <button
                          className="btn btn-sm btn-block btn-ghost justify-start"
                          data-set-theme="lemonade"
                        >
                          🍋 Lemonade
                        </button>
                      </li>
                      <li>
                        <button
                          className="btn btn-sm btn-block btn-ghost justify-start"
                          data-set-theme="night"
                        >
                          🌃 Night
                        </button>
                      </li>
                      <li>
                        <button
                          className="btn btn-sm btn-block btn-ghost justify-start"
                          data-set-theme="coffee"
                        >
                          ☕ Coffee
                        </button>
                      </li>
                      <li>
                        <button
                          className="btn btn-sm btn-block btn-ghost justify-start"
                          data-set-theme="winter"
                        >
                          ❄️ Winter
                        </button>
                      </li>
                      <li>
                        <button
                          className="btn btn-sm btn-block btn-ghost justify-start"
                          data-set-theme="dim"
                        >
                          🔅 Dim
                        </button>
                      </li>
                      <li>
                        <button
                          className="btn btn-sm btn-block btn-ghost justify-start"
                          data-set-theme="nord"
                        >
                          🏔️ Nord
                        </button>
                      </li>
                      <li>
                        <button
                          className="btn btn-sm btn-block btn-ghost justify-start"
                          data-set-theme="sunset"
                        >
                          🌅 Sunset
                        </button>
                      </li>
                    </ul>
                  </div>
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
