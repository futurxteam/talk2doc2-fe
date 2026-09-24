import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useTranslation } from "react-i18next";
import "./style/header.css";
import { Link, useNavigate } from "react-router-dom";
import { getUserProfile } from "../pages/api";

export default function Header() {
  const { toggleLanguage, language } = useLanguage();
  const { t } = useTranslation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [businessOpen, setBusinessOpen] = useState(false);
  const [appsOpen, setAppsOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();
  const headerRef = useRef(null);
useEffect(() => {
  if (menuOpen) {
    // Lock background scroll
    document.body.style.overflow = "hidden";
  } else {
    // Restore scroll
    document.body.style.overflow = "";
  }

  return () => {
    document.body.style.overflow = "";
  };
}, [menuOpen]);

  // Fetch user profile
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

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        closeAllMenus();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeAllMenus = () => {
    setMenuOpen(false);
    setBusinessOpen(false);
    setAppsOpen(false);
    setLangOpen(false);
    setUserMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    closeAllMenus();
    navigate("/");
  };

  const handleProfile = () => {
    closeAllMenus();
    if (user?.role === "ADMIN") navigate("/dashboard/admin");
    else if (user?.role === "DOCTOR") navigate("/dashboard/doctor");
    else navigate("/dashboard/patient");
  };

const toggleMobileMenu = () => {
  setMenuOpen((prev) => {
    const next = !prev;

    if (!prev) {
      // Reset submenus
      setBusinessOpen(false);
      setAppsOpen(false);
      setLangOpen(false);

      // Scroll menu to top
      setTimeout(() => {
        const nav = document.querySelector(".header-nav-menu");
        if (nav) nav.scrollTop = 0;
      }, 0);
    }

    return next;
  });
};

  return (
    <header className="header-site" ref={headerRef}>
      <div className="header-wrapper">

        {/* LEFT SECTION: LOGO */}
        <div className="header-left">
          <Link to="/" className="header-brand-logo-link" onClick={closeAllMenus}>
            <img
              src="/logo.jpg"
              alt="MyDoktor 24/7"
              className="header-logo-image"
              style={{
                borderRadius: 6,
                background: "#ffffff",
                padding: "2px 6px",
                objectFit: "contain",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
              }}
            />
          </Link>
        </div>

        {/* CENTER SECTION: NAVIGATION */}
        <div className="header-center">
          <nav className={`header-nav-menu ${menuOpen ? "header-mobile-active" : ""}`}>
            <ul className="header-nav-links">
              {/* Voice Line */}
              <li className="header-nav-item">
                <Link
                  to="/voice"
                  className="header-nav-link"
                  onClick={closeAllMenus}
                  style={{
                    color: "#2FBF71",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <span style={{ fontSize: "16px" }}>🎙️</span> Voice Line
                </Link>
              </li>

              {/* My Appointments */}
              <li className="header-nav-item">
                <Link
                  to="/appointments"
                  className="header-nav-link"
                  onClick={closeAllMenus}
                  style={{ fontWeight: "600" }}
                >
                  📅 My Appointments
                </Link>
              </li>

              {/* About */}
              <li className="header-nav-item">
                <Link to="/about" className="header-nav-link" onClick={closeAllMenus}>
                  {t("header.about")}
                </Link>
              </li>

              {/* Business Dropdown */}
              <li className={`header-nav-item header-has-dropdown ${businessOpen ? "header-active" : ""}`}>
                <span
                  className="header-nav-link header-dropdown-trigger"
                  onClick={() => setBusinessOpen(!businessOpen)}
                >
                  {t("header.business")}
                </span>
                <div className="header-sub-menu">
                  <p className="header-sub-menu-title">{t("header.businessDesc")}</p>
                  <a href="https://futureaceacademy.com/" target="_blank" rel="noopener noreferrer" className="header-sub-menu-link" onClick={closeAllMenus}>
                    {t("header.visitAcademy")} →
                  </a>
                </div>
              </li>

              {/* Apps Dropdown */}
              <li className={`header-nav-item header-has-dropdown ${appsOpen ? "header-active" : ""}`}>
                <span
                  className="header-nav-link header-dropdown-trigger"
                  onClick={() => setAppsOpen(!appsOpen)}
                >
                  {t("header.apps")}
                </span>
                <div className="header-sub-menu">
                  <Link to="/apps/ios" className="header-sub-menu-link" onClick={closeAllMenus}>iOS</Link>
                  <Link to="/apps/android" className="header-sub-menu-link" onClick={closeAllMenus}>Android</Link>
                </div>
              </li>

              {/* Language Dropdown */}
              <li className={`header-nav-item header-has-dropdown ${langOpen ? "header-active" : ""}`}>
                <span
                  className="header-nav-link header-dropdown-trigger"
                  onClick={() => setLangOpen(!langOpen)}
                >
                  {language === "en" ? "English" : "മലയാളം"}
                </span>
                <div className="header-sub-menu">
                  <button className="header-sub-menu-btn" onClick={() => { toggleLanguage("en"); closeAllMenus(); }}>English</button>
                  <button className="header-sub-menu-btn" onClick={() => { toggleLanguage("ml"); closeAllMenus(); }}>മലയാളം</button>
                </div>
              </li>
              {/* ================= MOBILE USER ACTIONS ================= */}
{user && (
  <>
    <li className="header-nav-item mobile-only">
      <span
        className="header-nav-link"
        onClick={() => {
          closeAllMenus();
          handleProfile();
        }}
      >
        {t("header.dashboard")}
      </span>
    </li>
{/* ================= MOBILE START INTERVIEW ================= */}
{user?.role === "PATIENT" && (
  <li className="header-nav-item mobile-only">
    <Link
      to="/interview"
      className="header-nav-link"
      onClick={closeAllMenus}
    >
      Start Interview
    </Link>
  </li>
)}

    <li className="header-nav-item mobile-only">
      <span
        className="header-nav-link"
        onClick={() => {
          handleLogout();
        }}
        style={{ color: "#ffb4b4" }}
      >
        {t("header.logout")}
      </span>
    </li>
  </>
)}

            </ul>
          </nav>
        </div>

        {/* RIGHT SECTION: AUTH & VISUALS */}
      <div className="header-right">

  {/* ================= USER AVATAR ================= */}
  {user && (
    <div className={`header-user-profile-wrapper ${userMenuOpen ? "header-active" : ""}`}>
      <button
        className="header-user-toggle-btn"
        onClick={() => setUserMenuOpen(!userMenuOpen)}
      >
        <div className="header-user-avatar-circle">
          {user.name.charAt(0).toUpperCase()}
        </div>
      </button>

      <div className="header-sub-menu header-user-dropdown-menu">
        <div className="header-user-info-header">
          <span className="header-user-name-text">{user.name}</span>
          <span className="header-user-role-text">{user.role}</span>
        </div>
        <div className="header-divider"></div>

        <button className="header-sub-menu-btn" onClick={handleProfile}>
          {t("header.dashboard")}
        </button>

        <button
          className="header-sub-menu-btn header-logout-text"
          onClick={handleLogout}
        >
          {t("header.logout")}
        </button>
      </div>
    </div>
  )}

  {/* ================= LOGIN (only if NOT logged in) ================= */}
  {!user && (
    <Link
      to="/login"
      className="header-nav-link header-login-link"
      onClick={closeAllMenus}
    >
      {t("header.login")}
    </Link>
  )}

  {/* ================= START INTERVIEW (only PATIENT) ================= */}
  {user?.role === "PATIENT" && (
    <Link
      to="/interview"
      className="header-btn-action header-btn-teal"
      onClick={closeAllMenus}
    >
      Start Interview
    </Link>
  )}

  {/* ================= MOBILE HAMBURGER ================= */}
  <button
    className={`header-hamburger-btn ${menuOpen ? "header-open" : ""}`}
    onClick={toggleMobileMenu}
  >
    <span className="header-bar"></span>
    <span className="header-bar"></span>
    <span className="header-bar"></span>
  </button>

</div>


      </div>
    </header>
  );
}
