import React, { useState, useEffect } from 'react';
import { Activity, Stethoscope, Sparkles, Layers, ShieldCheck } from 'lucide-react';
import BodyMap from './components/BodyMap';
import ChatBox from './components/ChatBox';
import './styles/App.css';

export default function App() {
  const [selectedBodyPart, setSelectedBodyPart] = useState(null);
  const [bodyPartsData, setBodyPartsData] = useState({});
  const [followUpQuestions, setFollowUpQuestions] = useState({});
  const [decisionTrees, setDecisionTrees] = useState({});
  const [activeMobileTab, setActiveMobileTab] = useState('both'); // 'bodymap' | 'chat' | 'both'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/bodyparts')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBodyPartsData(data.data);
          setFollowUpQuestions(data.followUpQuestions);
          setDecisionTrees(data.decisionTrees || {});
        }
      })
      .catch((err) => {
        console.error('Failed to load body parts:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleBodyPartSelect = (partId) => {
    setSelectedBodyPart(partId);
    // On mobile screens, automatically switch tab to chat upon body part selection
    if (window.innerWidth < 768) {
      setActiveMobileTab('chat');
    }
  };

  return (
    <div className="talk2doc-app">
      {/* Navigation Header */}
      <header className="app-navbar">
        <div className="navbar-container">
          <div className="brand-logo">
            <div className="brand-icon">
              <Activity size={24} />
            </div>
            <div>
              <div className="brand-name">
                talk2doc <span className="version-pill">2.0</span>
              </div>
              <div className="brand-tagline">Medical Department Recommendation System</div>
            </div>
          </div>

          <div className="navbar-right">
            <div className="status-badge">
              <ShieldCheck size={16} color="#10b981" />
              <span>Specialty Triage Mode</span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Tab Switcher */}
      <div className="mobile-tabs-bar">
        <button
          className={`mobile-tab-btn ${activeMobileTab === 'bodymap' ? 'active' : ''}`}
          onClick={() => setActiveMobileTab('bodymap')}
        >
          <Layers size={16} />
          <span>Interactive Body Map</span>
        </button>
        <button
          className={`mobile-tab-btn ${activeMobileTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveMobileTab('chat')}
        >
          <Stethoscope size={16} />
          <span>Triage Chat</span>
        </button>
      </div>

      {/* Main Workspace Split */}
      <main className="main-workspace">
        {/* Left: Interactive BodyMap SVG */}
        <section className={`workspace-col left-col ${activeMobileTab === 'chat' ? 'hide-mobile' : ''}`}>
          <div className="bodymap-panel">
            <div className="panel-header">
              <h3>Interactive Body Diagram</h3>
              <p>Click where you feel discomfort to begin</p>
            </div>

            <BodyMap
              onSelect={handleBodyPartSelect}
              selectedPart={selectedBodyPart}
            />

            {/* Quick Non-Front Body Area Shortcuts */}
            <div className="additional-parts-tray">
              <span className="tray-label">Other common areas:</span>
              <div className="tray-buttons">
                <button
                  className={`tray-btn ${selectedBodyPart === 'skin' ? 'selected' : ''}`}
                  onClick={() => handleBodyPartSelect('skin')}
                >
                  🧴 Skin & Rash
                </button>
                <button
                  className={`tray-btn ${selectedBodyPart === 'back' ? 'selected' : ''}`}
                  onClick={() => handleBodyPartSelect('back')}
                >
                  🦴 Back & Spine
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Right: Conversational Chatbot */}
        <section className={`workspace-col right-col ${activeMobileTab === 'bodymap' ? 'hide-mobile' : ''}`}>
          <ChatBox
            selectedBodyPart={selectedBodyPart}
            onBodyPartSelect={setSelectedBodyPart}
            bodyPartsData={bodyPartsData}
            followUpQuestions={followUpQuestions}
            decisionTrees={decisionTrees}
          />
        </section>
      </main>

      {/* Safety Footer */}
      <footer className="app-footer">
        <p>
          <strong>Medical Disclaimer:</strong> talk2doc guides users to relevant clinical departments for evaluation. It does not replace clinical diagnosis. If you experience crushing chest pain, difficulty breathing, or sudden neurological deficits, call emergency services immediately.
        </p>
      </footer>
    </div>
  );
}
