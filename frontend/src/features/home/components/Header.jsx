import React, { useEffect, useState } from "react";
import { themeChange } from "theme-change";
import MoonIcon from "@heroicons/react/24/outline/MoonIcon";
import SunIcon from "@heroicons/react/24/outline/SunIcon";
import { Link } from "react-router-dom";

const Header = () => {
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
    // 👆 false parameter is required for react project
  }, []);

  return (
    <header className="bg-base-100 shadow-md">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        {/* Logo */}
        <div className="text-xl font-bold text-primary">
          <Link to="#home">LOGO</Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex space-x-6">
          <Link to="#products" className="text-base hover:text-primary">
            Link
          </Link>
          <Link to="#why-choose-us" className="text-base hover:text-primary">
            Link
          </Link>
          <Link to="#pricing" className="text-base hover:text-primary">
            And Link
          </Link>
        </nav>

        {/* Light and dark theme selection toogle **/}
        {/* <label className="swap">
          <input type="checkbox" />
          <MoonIcon
            data-set-theme="light"
            data-act-class="ACTIVECLASS"
            className={
              "fill-current w-6 h-6 " +
              (currentTheme === "dark" ? "swap-on" : "swap-off")
            }
          />
          <SunIcon
            data-set-theme="dark"
            data-act-class="ACTIVECLASS"
            className={
              "fill-current w-6 h-6 " +
              (currentTheme === "light" ? "swap-on" : "swap-off")
            }
          />
        </label> */}

        {/* Buttons */}
        <div className="hidden lg:flex space-x-4">
          <Link to="/login" className="btn btn-outline btn-primary">
            Login
          </Link>
          <Link to="/register" className="btn btn-primary">
            Sign Up
          </Link>
        </div>

        {/* Mobile Menu */}
        <div className="lg:hidden dropdown dropdown-end relative z-50">
          <label tabIndex={0} className="btn btn-ghost btn-circle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </label>
          <ul
            tabIndex={0}
            className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <Link to="#products"> Link</Link>
            </li>
            <li>
              <Link to="#why-choose-us"> Link</Link>
            </li>
            <li>
              <Link to="#pricing">And Link</Link>
            </li>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/register">Sign Up</Link>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;
