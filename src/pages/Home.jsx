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
    fetch("/api/bodyparts")
      .then((res) => res.json())
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
              <h1>
                AI-Powered Symptom Analysis
                <br />
                with Verified Doctor Consultations
              </h1>

              <p>
                Experience the future of healthcare with <strong>Talk2Doc</strong> –
                an intelligent AI symptom predictor that connects you with verified
                medical professionals for accurate diagnosis and treatment.
              </p>

              <ul className="feature-list">
                <li>✔ AI-Powered Symptom Analysis in Real-Time</li>
                <li>✔ Verified Doctor Consultations & Approvals</li>
                <li>✔ Comprehensive Medical History Tracking</li>
                <li>✔ Secure & HIPAA-Compliant Platform</li>
              </ul>

              <div className="cta-buttons">
                <button
                  className="btn-primary"
                  onClick={() => window.location.href = '/login'}
                >
                  Get Started
                </button>
                <button
                  className="btn-secondary"
                  onClick={openChatGuarded}
                >
                  Try AI Chat
                </button>
              </div>

              <p className="trust-badge">
                🏥 Trusted by 10,000+ patients • ⭐ 4.8/5 rating
              </p>
            </div>
          </Reveal>

          {/* Floating Try Chat Button */}
          {!openChat && (
            <button className="chat-fab" onClick={openChatGuarded}>
              💬 {t("home.tryChat")}
            </button>
          )}

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

                <div className="home-chat-modal-body">
                  <ChatBox
                    bodyPartsData={bodyPartsData}
                    followUpQuestions={followUpQuestions}
                    decisionTrees={decisionTrees}
                    onRecommendation={(rec) => {
                      // Recommendation produced
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Right Section */}
          <Reveal direction="right" delay={200}>
            <div className="home-right">
              <img src="./public/mobile.png" alt="Talk2Doc App Preview" />
            </div>
          </Reveal>
        </div>

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
