import { useState } from "react";
import { FiMoon, FiSun, FiUser, FiX } from "react-icons/fi";
import { LuBookOpen, LuChevronRight, LuSettings, LuSparkles } from "react-icons/lu";
import { useTheme } from "../ThemeContext.jsx";
import "./Navbar.css";

function Navbar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const { darkMode, toggleTheme } = useTheme();

  return (
    <header className="navbar">
      <div className="navbar-logo">
        <span className="logo-sparkle">✦</span>
        <span>Lumi</span>
        <span className="logo-ai">AI</span>
      </div>

      <nav className="navbar-links">
        <a href="#home" className="active">
          Home
        </a>
        <a href="#features">Features</a>
        <a href="#ask">Ask Lumi</a>
        <a href="#about">About</a>
      </nav>

      <div className="navbar-actions">
        <button
  className="icon-button"
  aria-label="Toggle theme"
  type="button"
  onClick={toggleTheme}
>
  {darkMode ? <FiSun /> : <FiMoon />}
</button>

        <button
          className="profile-button"
          aria-label="Open profile"
          type="button"
          onClick={() => setProfileOpen(!profileOpen)}
        >
          {profileOpen ? <FiX /> : <FiUser />}
        </button>
      </div>

      {profileOpen && (
        <div className="profile-menu">
          <div className="profile-header">
            <div className="profile-avatar">
              <FiUser />
            </div>

            <div>
              <strong>My Profile</strong>
              <span>Welcome to LumiAI</span>
            </div>
          </div>

          <div className="profile-divider"></div>

          <button type="button" className="profile-menu-item">
            <span className="menu-item-icon">
              <LuSparkles />
            </span>

            <span className="menu-item-text">
              <strong>Learning Progress</strong>
              <small>See your study journey</small>
            </span>

            <LuChevronRight />
          </button>

          <button type="button" className="profile-menu-item">
            <span className="menu-item-icon">
              <LuBookOpen />
            </span>

            <span className="menu-item-text">
              <strong>Saved Questions</strong>
              <small>Review your previous questions</small>
            </span>

            <LuChevronRight />
          </button>

          <button type="button" className="profile-menu-item">
            <span className="menu-item-icon">
              <LuSettings />
            </span>

            <span className="menu-item-text">
              <strong>Settings</strong>
              <small>Customize your experience</small>
            </span>

            <LuChevronRight />
          </button>
        </div>
      )}
    </header>
  );
}

export default Navbar;