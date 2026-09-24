import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Reveal from "../components/Reveal";
import "./style/Home.css";
import { SymptomCarousel } from "./about";
import ChatBox from "../components/plugin/ChatBox";
import "../components/plugin/plugin.css";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { LuBot, LuX, LuExternalLink, LuActivity } from "react-icons/lu";
import { getCurrentUser } from "../api/usersApi";
import API_BASE_URL from "../config";

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [openChat, setOpenChat] = useState(false);

  // Auth-guarded chat opener — redirects to login if not authenticated
  const openChatGuarded = () => {
    const user = getCurrentUser();
    if (!user) {
      navigate("/login?redirect=/interview");
      return;
    }
    setOpenChat(true);
  };
  const [bodyPartsData, setBodyPartsData] = useState({});
  const [followUpQuestions, setFollowUpQuestions] = useState({});
  const [decisionTrees, setDecisionTrees] = useState({});

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/bodyparts`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Unable to load chatbot data (${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setBodyPartsData(data.data || {});
          setFollowUpQuestions(data.followUpQuestions || {});
          setDecisionTrees(data.decisionTrees || {});
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="home-wrapper">
      <Header />

      <main className="home-container">
        <div className="home-content">
          {/* Left Section */}
          <Reveal direction="top">
            <div className="home-left">
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(47, 191, 113, 0.12)",
                  color: "#1D6B45",
                  border: "1px solid rgba(47, 191, 113, 0.3)",
                  padding: "6px 14px",
                  borderRadius: "999px",
                  fontSize: "13px",
                  fontWeight: "700",
                  marginBottom: "16px",
                }}
              >
                <span>🎙️</span> NEW: 24/7 AI Doctor Voice Line (English & Malayalam)
              </div>

              <h1>
                Speak to AI Doctors.
                <br />
                Instant Matching & Slot Booking.
              </h1>

              <p>
                Experience the future of healthcare with <strong>Talk2Doc</strong>. Dial our 24/7 AI voice line to speak with Meera in English, Malayalam, Hindi or Tamil, get clinical specialist referrals across 90+ doctors in Kochi, and book your appointment automatically.
              </p>

              <ul className="feature-list">
                <li>✔ 🎙️ 24/7 AI Voice Hotline — No App Download Needed</li>
                <li>✔ 🏥 90 Verified Specialists across 15 Kochi Localities</li>
                <li>✔ ⚡ Instant Account Creation by Phone & Slot Booking</li>
                <li>✔ 🛡️ Emergency Red-Flag Triage & 108 Dispatch Alerts</li>
              </ul>

              <div className="cta-buttons">
                <button
                  className="btn-primary"
                  style={{
                    background: "#2FBF71",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontWeight: "700",
                  }}
                  onClick={() => navigate("/voice")}
                >
                  <span>🎙️</span> Call AI Voice Line (Demo)
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => navigate("/interview")}
                >
                  💬 Try AI Chat Triage
                </button>
              </div>

              <p className="trust-badge">
                🏥 90+ Doctors • 76 Partner Clinics in Kochi • ⭐ 4.9/5 satisfaction
              </p>
            </div>
          </Reveal>


          {/* Modern talk2doc Triage Modal */}
          {openChat && (
            <div className="home-chat-modal-overlay" onClick={() => setOpenChat(false)}>
              <div className="home-chat-modal" onClick={(e) => e.stopPropagation()}>
                <div className="home-chat-modal-header">
                  <div className="modal-title-group">
                    <div className="modal-bot-icon">
                      <LuActivity size={18} />
                    </div>
                    <div>
                      <h4>FutuRx talk2doc Assistant</h4>
                      <span>Instant Clinical Specialty Triage</span>
                    </div>
                  </div>
                  <div className="modal-header-actions">
                    <button
                      className="modal-full-btn"
                      onClick={() => navigate('/interview')}
                      title="Open Full Screen Symptom Checker"
                    >
                      <LuExternalLink size={15} />
                      <span>Full View</span>
                    </button>
                    <button
                      className="modal-close-btn"
                      onClick={() => setOpenChat(false)}
                      title="Close"
                    >
                      <LuX size={18} />
                    </button>
                  </div>
                </div>


              </div>
            </div>
          )}

          {/* Right Section */}
          <Reveal direction="right" delay={200}>
            <div className="home-right">
              <img src="/mobile.png" alt="Talk2Doc App Preview" />
            </div>
          </Reveal>
        </div>

        {/* 🎙️ Voice Hotline Showcase Section */}
        <Reveal direction="bottom">
          <section
            style={{
              background: "linear-gradient(135deg, #0F3B3D 0%, #09292B 100%)",
              borderRadius: "24px",
              padding: "36px 32px",
              color: "#E7F1EC",
              margin: "40px 0 50px",
              boxShadow: "0 20px 40px rgba(15, 59, 61, 0.25)",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "28px",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(141, 191, 175, 0.2)",
                  color: "#8DBFAF",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  marginBottom: "12px",
                }}
              >
                🎙️ Instant Voice Line · Toll-Free 1800 247 3658
              </div>

              <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#FFFFFF", marginBottom: "10px" }}>
                Phone-In AI Doctor Referral & Instant Slot Booking
              </h2>

              <p style={{ color: "#A7C7BE", fontSize: "15px", lineHeight: "1.5", marginBottom: "20px" }}>
                Speak directly with <b>Meera</b>. She evaluates symptoms, identifies red-flag emergencies, recommends clinical specialties, queries our database of 90 doctors in Kochi based on your distance and insurance, and automatically registers your appointment!
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                <button
                  style={{
                    background: "#2FBF71",
                    color: "#fff",
                    border: "none",
                    padding: "12px 20px",
                    borderRadius: "10px",
                    fontWeight: "700",
                    fontSize: "14px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                  onClick={() => navigate("/voice")}
                >
                  ⚡ Launch Voice Split Demo
                </button>

                <button
                  style={{
                    background: "rgba(255, 255, 255, 0.12)",
                    color: "#fff",
                    border: "1px solid rgba(255, 255, 255, 0.25)",
                    padding: "12px 18px",
                    borderRadius: "10px",
                    fontWeight: "600",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate("/voice/call")}
                >
                  📱 Mobile Dial Pad
                </button>

                <button
                  style={{
                    background: "rgba(255, 255, 255, 0.12)",
                    color: "#fff",
                    border: "1px solid rgba(255, 255, 255, 0.25)",
                    padding: "12px 18px",
                    borderRadius: "10px",
                    fontWeight: "600",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate("/voice/live")}
                >
                  🖥️ Live Operator Feed
                </button>
              </div>
            </div>

            <div
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(141, 191, 175, 0.2)",
                borderRadius: "18px",
                padding: "24px",
              }}
            >
              <h3 style={{ fontSize: "16px", color: "#8DBFAF", marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Directory Highlights
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div style={{ background: "rgba(0,0,0,0.2)", padding: "12px", borderRadius: "10px" }}>
                  <div style={{ fontSize: "24px", fontWeight: "800", color: "#2FBF71" }}>90</div>
                  <div style={{ fontSize: "12px", color: "#A7C7BE" }}>Verified Specialists</div>
                </div>
                <div style={{ background: "rgba(0,0,0,0.2)", padding: "12px", borderRadius: "10px" }}>
                  <div style={{ fontSize: "24px", fontWeight: "800", color: "#F4C95D" }}>15</div>
                  <div style={{ fontSize: "12px", color: "#A7C7BE" }}>Kochi Localities</div>
                </div>
                <div style={{ background: "rgba(0,0,0,0.2)", padding: "12px", borderRadius: "10px" }}>
                  <div style={{ fontSize: "24px", fontWeight: "800", color: "#8DBFAF" }}>76</div>
                  <div style={{ fontSize: "12px", color: "#A7C7BE" }}>Partner Clinics</div>
                </div>
                <div style={{ background: "rgba(0,0,0,0.2)", padding: "12px", borderRadius: "10px" }}>
                  <div style={{ fontSize: "24px", fontWeight: "800", color: "#38BDF8" }}>4</div>
                  <div style={{ fontSize: "12px", color: "#A7C7BE" }}>Languages Spoken</div>
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        {/* How It Works Section */}
        <Reveal direction="bottom">
          <section className="how-it-works">
            <h2>How Talk2Doc Works</h2>
            <div className="steps-grid">
              <div className="step-card">
                <div className="step-icon">🤖</div>
                <h3>1. Describe Symptoms</h3>
                <p>Share your symptoms with our AI-powered chatbot for instant preliminary analysis</p>
              </div>
              <div className="step-card">
                <div className="step-icon">🔍</div>
                <h3>2. AI Analysis</h3>
                <p>Our advanced AI analyzes your symptoms and suggests possible conditions</p>
              </div>
              <div className="step-card">
                <div className="step-icon">👨‍⚕️</div>
                <h3>3. Doctor Verification</h3>
                <p>Verified doctors review and approve all AI-generated diagnoses</p>
              </div>
              <div className="step-card">
                <div className="step-icon">💊</div>
                <h3>4. Get Treatment</h3>
                <p>Receive personalized treatment plans and medication recommendations</p>
              </div>
            </div>
          </section>
        </Reveal>

        {/* Symptom Carousel */}
        <Reveal direction="top">
          <div className="symptom-carousel-section">
            <h2>Meet Our Verified Doctors</h2>
            <SymptomCarousel />
          </div>
        </Reveal>

        {/* Why Choose Talk2Doc */}
        <Reveal direction="bottom">
          <section className="why-choose">
            <h2>Why Choose Talk2Doc?</h2>
            <div className="benefits-grid">
              <div className="benefit-card">
                <span className="benefit-icon">⚡</span>
                <h3>Instant AI Analysis</h3>
                <p>Get preliminary diagnosis in minutes, not hours</p>
              </div>
              <div className="benefit-card">
                <span className="benefit-icon">🛡️</span>
                <h3>Doctor Verified</h3>
                <p>All AI predictions reviewed by licensed physicians</p>
              </div>
              <div className="benefit-card">
                <span className="benefit-icon">📊</span>
                <h3>Complete History</h3>
                <p>Track all your medical consultations in one place</p>
              </div>
              <div className="benefit-card">
                <span className="benefit-icon">🔒</span>
                <h3>100% Secure</h3>
                <p>Your health data is encrypted and HIPAA-compliant</p>
              </div>
            </div>
          </section>
        </Reveal>
      </main>

      <Footer />
    </div>
  );
}
