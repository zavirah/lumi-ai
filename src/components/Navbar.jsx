import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FiMoon, FiSun, FiUser, FiX } from "react-icons/fi";
import { LuBookOpen, LuChevronRight, LuSettings, LuSparkles } from "react-icons/lu";
import { useTheme } from "../ThemeContext.jsx";
import { COURSE_STORAGE_KEY, COURSE_UPDATE_EVENT } from "./CourseHub.jsx";
import "./Navbar.css";

function Navbar({ user, signOut }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [courseSummary, setCourseSummary] = useState({ courses: 0, completed: 0 });
  const [replyStyle, setReplyStyle] = useState(() => localStorage.getItem("lumi-reply-style") || "balanced");
  const { darkMode, toggleTheme } = useTheme();

  useEffect(() => {
    const updateSummary = () => {
      try {
        const courses = JSON.parse(localStorage.getItem(COURSE_STORAGE_KEY) || "[]");
        setCourseSummary({
          courses: courses.length,
          completed: courses.reduce((total, course) => total + (course.lessons || []).filter((lesson) => lesson.completed).length, 0),
        });
      } catch {
        setCourseSummary({ courses: 0, completed: 0 });
      }
    };
    updateSummary();
    window.addEventListener("storage", updateSummary);
    window.addEventListener(COURSE_UPDATE_EVENT, updateSummary);
    return () => {
      window.removeEventListener("storage", updateSummary);
      window.removeEventListener(COURSE_UPDATE_EVENT, updateSummary);
    };
  }, []);

  const goToSection = (sectionId) => {
    setProfileOpen(false);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const chooseReplyStyle = (style) => {
    setReplyStyle(style);
    localStorage.setItem("lumi-reply-style", style);
  };

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
        <a href="#courses">Courses</a>
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
              <strong>{user?.user_metadata?.full_name || "My Profile"}</strong>
              <span>{courseSummary.courses} courses · {courseSummary.completed} lessons complete</span>
            </div>
          </div>

          <div className="profile-divider"></div>

          <button type="button" className="profile-menu-item" onClick={() => goToSection("course-progress")}>
            <span className="menu-item-icon">
              <LuSparkles />
            </span>

            <span className="menu-item-text">
              <strong>Learning Progress</strong>
              <small>See your courses and lesson progress</small>
            </span>

            <LuChevronRight />
          </button>

          <button type="button" className="profile-menu-item" onClick={() => { setProfileOpen(false); document.getElementById("ask")?.scrollIntoView({ behavior: "smooth" }); window.dispatchEvent(new Event("lumi:show-history")); }}>
            <span className="menu-item-icon">
              <LuBookOpen />
            </span>

            <span className="menu-item-text">
              <strong>Saved Questions</strong>
              <small>Review your previous questions</small>
            </span>

            <LuChevronRight />
          </button>
          <button type="button" className="profile-menu-item" onClick={() => { setProfileOpen(false); setSettingsOpen(true); }}>
            <span className="menu-item-icon">
              <LuSettings />
            </span>

            <span className="menu-item-text">
              <strong>Settings</strong>
              <small>Customize your experience</small>
            </span>

            <LuChevronRight />
          </button>

          <button type="button" className="profile-menu-item" onClick={signOut}>
            <span className="menu-item-icon"><FiUser /></span>
            <span className="menu-item-text"><strong>Sign out</strong><small>{user?.email}</small></span>
            <LuChevronRight />
          </button>
        </div>
      )}

      {settingsOpen && createPortal(
        <div className="settings-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSettingsOpen(false); }}>
          <section className="settings-dialog" role="dialog" aria-modal="true" aria-labelledby="settings-title">
            <div className="settings-dialog-header">
              <div>
                <span className="settings-eyebrow">MAKE LUMI YOURS</span>
                <h2 id="settings-title">Settings</h2>
              </div>
              <button type="button" className="settings-close" onClick={() => setSettingsOpen(false)} aria-label="Close settings"><FiX /></button>
            </div>

            <div className="settings-section">
              <h3>Account</h3>
              <div className="settings-account">
                <span className="settings-account-avatar"><FiUser /></span>
                <div><strong>{user?.user_metadata?.full_name || "Lumi learner"}</strong><span>{user?.email}</span></div>
              </div>
            </div>

            <div className="settings-section">
              <h3>Appearance</h3>
              <p>Choose the look that feels comfortable.</p>
              <div className="settings-choice-row">
                <button type="button" className={`settings-choice ${!darkMode ? "selected" : ""}`} aria-pressed={!darkMode} onClick={() => { if (darkMode) toggleTheme(); }}>Light</button>
                <button type="button" className={`settings-choice ${darkMode ? "selected" : ""}`} aria-pressed={darkMode} onClick={() => { if (!darkMode) toggleTheme(); }}>Dark</button>
              </div>
            </div>

            <div className="settings-section">
              <h3>Lumi’s reply style</h3>
              <p>Lumi will still adapt to what you’re talking about.</p>
              <div className="settings-style-list">
                {[
                  ["balanced", "Balanced", "A natural mix of warmth and detail"],
                  ["warm", "Warm & encouraging", "A little more reassurance and encouragement"],
                  ["concise", "Clear & concise", "Practical answers with less extra detail"],
                ].map(([value, title, description]) => (
                  <button type="button" key={value} className={`settings-style-option ${replyStyle === value ? "selected" : ""}`} aria-pressed={replyStyle === value} onClick={() => chooseReplyStyle(value)}>
                    <span className="settings-radio" />
                    <span><strong>{title}</strong><small>{description}</small></span>
                  </button>
                ))}
              </div>
            </div>

            <div className="settings-privacy"><LuSparkles /><span>Your reply preference is saved on this device. Your saved chats are private to your account.</span></div>
          </section>
        </div>,
        document.body
      )}
    </header>
  );
}

export default Navbar;
