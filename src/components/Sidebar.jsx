import React, { useEffect, useState } from "react";
import "./style/Sidebar.css";
import { getUserProfile } from "../pages/api";

const Sidebar = ({ activeSection, setActiveSection, onLogout, onStartInterview }) => {
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false); // Mobile toggle state

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        setUser(data.user);
      } catch (err) {
        console.error("Failed to fetch profile:", err.message);
        localStorage.removeItem("token");
      }
    };
    fetchProfile();
  }, []);

  return (
    <>
      {/* Mobile Menu Button */}
      <button className="new-mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "✕" : "☰"}
      </button>

      {/* Overlay */}
      {isOpen && <div className="new-sidebar-overlay" onClick={() => setIsOpen(false)} />}

      <aside className={`new-sidebar ${isOpen ? "open" : ""}`}>
        {/* BRAND & USER */}
        <div className="new-sidebar-header">
          <img src="/Talk2Doc.png" alt="Talk2Doc Logo" className="new-sidebar-logo" />
          <div className="new-sidebar-avatar">
            {user?.name?.[0] || "U"}
          </div>
          <div className="new-sidebar-username">
            {user?.name || "User"}
          </div>
        </div>

        {/* MENU */}
        <nav className="new-sidebar-nav">
          <button
            className={`new-sidebar-link ${activeSection === "interview" ? "active" : ""}`}
            onClick={() => { setActiveSection("interview"); setIsOpen(false); }}
          >
            Start Interview
          </button>

          <button
            className={`new-sidebar-link ${activeSection === "profile" ? "active" : ""}`}
            onClick={() => { setActiveSection("profile"); setIsOpen(false); }}
          >
            Profile
          </button>

          <button
            className={`new-sidebar-link ${activeSection === "history" ? "active" : ""}`}
            onClick={() => { setActiveSection("history"); setIsOpen(false); }}
          >
            Diagnosis History
          </button>

          <button
            className={`new-sidebar-link ${activeSection === "appointments" ? "active" : ""}`}
            onClick={() => { setActiveSection("appointments"); setIsOpen(false); }}
          >
            My Appointments
          </button>

          <button className="new-sidebar-logout" onClick={onLogout}>
            ⏻ Logout
          </button>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;