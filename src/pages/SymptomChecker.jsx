import React, { useState, useEffect, useRef } from 'react';
import API_BASE_URL from '../config';
import { 
  LuActivity, 
  LuStethoscope, 
  LuLayers, 
  LuShieldCheck, 
  LuUser, 
  LuMapPin, 
  LuCalendar, 
  LuAward, 
  LuDollarSign,
  LuArrowLeft,
  LuChevronDown,
  LuChevronUp,
  LuCircleCheck,
  LuInfo,
  LuClock,
  LuNavigation,
  LuCompass,
  LuFilter,
  LuShield
} from 'react-icons/lu';
import { useNavigate, Link } from 'react-router-dom';
import BodyMap from '../components/BodyMap';
import ChatBox from '../components/plugin/ChatBox';
import BookAppointmentWidget from './BookAppointment';
import { getCurrentUser } from '../api/usersApi';
import '../components/plugin/plugin.css';
import './style/SymptomChecker.css';

const BUCKET_LABELS = {
  '0-5': { title: 'Within 5 km', icon: '🟢', desc: 'Nearest healthcare providers' },
  '5-10': { title: '5 – 10 km', icon: '🟡', desc: 'Within short driving distance' },
  '10-15': { title: '10 – 15 km', icon: '🟠', desc: 'Metropolitan area' },
  '15-50': { title: '15 – 50 km', icon: '🔴', desc: 'Extended regional network' },
};

export default function SymptomChecker() {
  const navigate = useNavigate();

  // ── Auth Gate: redirect to login if not authenticated ──────────────
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate('/login?redirect=/interview', { replace: true });
    }
  }, [navigate]);

  const [selectedBodyPart, setSelectedBodyPart] = useState(null);
  const [bodyPartsData, setBodyPartsData] = useState({});
  const [followUpQuestions, setFollowUpQuestions] = useState({});
  const [decisionTrees, setDecisionTrees] = useState({});
  const [activeMobileTab, setActiveMobileTab] = useState('both'); // 'bodymap' | 'chat' | 'both'
  const [loading, setLoading] = useState(true);

  // Recommendation & Doctor State
  const [currentRecommendation, setCurrentRecommendation] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [fallbackMessage, setFallbackMessage] = useState(null);
  const [expandedDoctor, setExpandedDoctor] = useState(null);
  const [bookedAppointment, setBookedAppointment] = useState(null);

  // Geolocation & Filter State
  const [nearbyGroups, setNearbyGroups] = useState(null);
  const [locatingNearby, setLocatingNearby] = useState(false);
  const [locationStatus, setLocationStatus] = useState('idle'); // 'idle' | 'locating' | 'granted' | 'denied'
  const [selectedRadius, setSelectedRadius] = useState(50); // km
  const [selectedInsurance, setSelectedInsurance] = useState('all');
  const [insuranceProviders, setInsuranceProviders] = useState([]);
  const [userCoords, setUserCoords] = useState(null); // { lat, lng }

  const doctorsSectionRef = useRef(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Load body parts data
    fetch(`${API_BASE_URL}/api/bodyparts`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBodyPartsData(data.data || {});
          setFollowUpQuestions(data.followUpQuestions || {});
          setDecisionTrees(data.decisionTrees || {});
        }
      })
      .catch((err) => console.error('Failed to load body parts:', err))
      .finally(() => setLoading(false));

    // Load insurance providers for filter dropdown
    fetch(`${API_BASE_URL}/api/auth/insurance-providers`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.providers)) setInsuranceProviders(data.providers);
      })
      .catch(() => {});
  }, []);

  // Fetch doctors and trigger location radius check whenever a recommendation is produced
  useEffect(() => {
    if (currentRecommendation?.department) {
      const dept = currentRecommendation.department;
      setLoadingDoctors(true);
      setExpandedDoctor(null);
      setBookedAppointment(null);

      // 1. Fetch default doctor list
      fetch(`${API_BASE_URL}/api/triage/doctors?department=${encodeURIComponent(dept)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setDoctors(data.doctors || []);
            setIsFallback(Boolean(data.isFallback));
            setFallbackMessage(data.fallbackMessage || null);
          } else {
            setDoctors([]);
            setIsFallback(false);
            setFallbackMessage(null);
          }
        })
        .catch((err) => {
          console.error('Failed to fetch doctors:', err);
          setDoctors([]);
        })
        .finally(() => {
          setLoadingDoctors(false);
          setTimeout(() => {
            doctorsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 300);
        });

      // 2. Automatically attempt nearby geolocation radius fetch
      fetchNearbyDoctors(dept);
    } else {
      setDoctors([]);
      setNearbyGroups(null);
      setIsFallback(false);
      setFallbackMessage(null);
      setExpandedDoctor(null);
      setBookedAppointment(null);
    }
  }, [currentRecommendation]);

  const fetchNearbyDoctors = (dept, radiusOverride, insuranceOverride) => {
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      return;
    }

    const radius = radiusOverride ?? selectedRadius;
    const insurance = insuranceOverride ?? selectedInsurance;

    setLocatingNearby(true);
    setLocationStatus('locating');

    const doFetch = async (lat, lng) => {
      try {
        const url = `${API_BASE_URL}/api/user/nearby?lat=${lat}&lng=${lng}&specialty=${encodeURIComponent(dept || '')}&radius=${radius}&insurance=${encodeURIComponent(insurance)}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.success && data.groups) {
          setNearbyGroups(data.groups);
          setLocationStatus('granted');
          if (data.isFallback) {
            setIsFallback(true);
            if (data.fallbackMessage) setFallbackMessage(data.fallbackMessage);
          }
        } else {
          setLocationStatus('idle');
        }
      } catch (e) {
        console.error('Failed to fetch nearby radius doctors:', e);
        setLocationStatus('idle');
      } finally {
        setLocatingNearby(false);
      }
    };

    // Reuse cached coords if we have them, otherwise prompt GPS
    if (userCoords) {
      doFetch(userCoords.lat, userCoords.lng);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserCoords({ lat, lng });
        doFetch(lat, lng);
      },
      (err) => {
        console.warn('Geolocation denied:', err.message);
        setLocationStatus('denied');
        setLocatingNearby(false);
      },
      { timeout: 7000, enableHighAccuracy: false }
    );
  };

  // Re-fetch when radius or insurance filter changes (if location already granted)
  useEffect(() => {
    if (locationStatus === 'granted' && currentRecommendation?.department && userCoords) {
      fetchNearbyDoctors(currentRecommendation.department, selectedRadius, selectedInsurance);
    }
  }, [selectedRadius, selectedInsurance]);

  const handleBodyPartSelect = (partId) => {
    setSelectedBodyPart(partId);
    if (window.innerWidth < 768) {
      setActiveMobileTab('chat');
    }
  };

  const toggleDoctorBooking = (doctorId) => {
    setExpandedDoctor(prev => prev === doctorId ? null : doctorId);
  };

  // Helper to render a single doctor card
  const renderDoctorCard = (doc) => {
    const isExpanded = expandedDoctor === doc._id;
    const initials = doc.fullName
      ? doc.fullName.replace('Dr.', '').trim().slice(0, 2).toUpperCase()
      : 'DR';

    return (
      <div 
        key={doc._id} 
        className={`doctor-card ${isExpanded ? 'is-expanded' : ''}`}
      >
        <div className="doctor-card-main">
          <div className="doctor-card-top">
            <div className="doctor-avatar-circle">
              {initials}
            </div>
            <div className="doctor-info-block">
              <h3>{doc.fullName.startsWith('Dr.') ? doc.fullName : `Dr. ${doc.fullName}`}</h3>
              <div className="doctor-badges">
                <span className="specialty-tag">{doc.specialization}</span>
                {doc.yearsOfExperience > 0 && (
                  <span className="exp-badge">
                    <LuAward size={12} /> {doc.yearsOfExperience} yrs exp
                  </span>
                )}
                {doc.distanceKm && (
                  <span className="distance-badge">
                    <LuNavigation size={11} /> {doc.distanceKm} km away
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="doctor-meta-grid">
            <div className="meta-row">
              <LuMapPin size={15} className="meta-icon" />
              <div className="meta-text">
                <span className="hospital-name-text">{doc.hospitalName || 'Partner Hospital'}</span>
                {doc.hospitalAddress && (
                  <span className="hospital-address-sub">{doc.hospitalAddress}</span>
                )}
              </div>
            </div>

            <div className="meta-row meta-fee-row">
              <div className="fee-pill">
                <span className="fee-label">Fee:</span>
                <span className="fee-amount">₹{doc.consultationFee || 0}</span>
              </div>
              <div className="hours-pill">
                <LuClock size={13} />
                <span>{doc.workingHours?.start || '09:00'} - {doc.workingHours?.end || '17:00'}</span>
              </div>
            </div>

            {/* Insurance Accepted Badges */}
            {doc.acceptedInsurances && doc.acceptedInsurances.length > 0 && (
              <div className="insurance-badges-row">
                <LuShield size={13} className="insurance-icon" />
                <div className="insurance-tags">
                  {doc.acceptedInsurances.slice(0, 3).map((ins) => (
                    <span key={ins} className="insurance-tag">{ins}</span>
                  ))}
                  {doc.acceptedInsurances.length > 3 && (
                    <span className="insurance-tag insurance-tag-more">+{doc.acceptedInsurances.length - 3} more</span>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            className={`book-doctor-toggle-btn ${isExpanded ? 'active' : ''}`}
            onClick={() => toggleDoctorBooking(doc._id)}
          >
            <LuCalendar size={16} />
            <span>{isExpanded ? 'Close Booking' : 'Book Appointment'}</span>
            {isExpanded ? <LuChevronUp size={16} /> : <LuChevronDown size={16} />}
          </button>
        </div>

        {/* Inline Booking Drawer powered by BookAppointmentWidget */}
        {isExpanded && (
          <div className="doctor-booking-drawer">
            <div className="drawer-header">
              <h4>Select Consultation Date & Time Slot</h4>
              <p>Consultation with {doc.fullName}</p>
            </div>
            <BookAppointmentWidget
              doctorId={doc._id}
              assessmentId={null}
              onBooked={(appointment) => {
                setBookedAppointment(appointment);
                setExpandedDoctor(null);
              }}
            />
          </div>
        )}
      </div>
    );
  };

  const hasNearbyResults = nearbyGroups && Object.values(nearbyGroups).some(g => g.length > 0);

  return (
    <div className="talk2doc-app symptom-checker-page">
      {/* Modern Navigation Header */}
      <header className="app-navbar">
        <div className="navbar-container">
          <div className="brand-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <div className="brand-icon">
              <LuActivity size={24} />
            </div>
            <div>
              <div className="brand-name">
                FutuRx <span className="brand-accent">talk2doc</span> <span className="version-pill">2.0</span>
              </div>
              <div className="brand-tagline">Clinical Triage & Specialist Recommendation</div>
            </div>
          </div>

          <div className="navbar-actions">
            <button 
              className="nav-btn-secondary" 
              onClick={() => navigate('/')}
              title="Return to Main Portal"
            >
              <LuArrowLeft size={16} />
              <span>Back to Home</span>
            </button>

            {token && (
              <button 
                className="nav-btn-primary" 
                onClick={() => navigate('/dashboard/patient')}
                title="View Appointments & Health Records"
              >
                <LuCalendar size={16} />
                <span>My Appointments</span>
              </button>
            )}

            <div className="status-badge">
              <LuShieldCheck size={16} color="#10b981" />
              <span>AI-Guided Triage</span>
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
          <LuLayers size={16} />
          <span>Interactive Body Map</span>
        </button>
        <button
          className={`mobile-tab-btn ${activeMobileTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveMobileTab('chat')}
        >
          <LuStethoscope size={16} />
          <span>Triage Assistant</span>
        </button>
      </div>

      {/* Main Workspace Split */}
      <main className="main-workspace">
        {/* Left: Interactive BodyMap SVG */}
        <section className={`workspace-col left-col ${activeMobileTab === 'chat' ? 'hide-mobile' : ''}`}>
          <div className="bodymap-panel">
            <div className="panel-header">
              <div className="panel-header-badge">Step 1</div>
              <h3>Interactive Body Diagram</h3>
              <p>Select anatomical location of your symptoms</p>
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
                  🧴 Skin & Dermatology
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

        {/* Right: Duolingo-Style Conversational Wizard */}
        <section className={`workspace-col right-col ${activeMobileTab === 'bodymap' ? 'hide-mobile' : ''}`}>
          <ChatBox
            selectedBodyPart={selectedBodyPart}
            onBodyPartSelect={setSelectedBodyPart}
            bodyPartsData={bodyPartsData}
            followUpQuestions={followUpQuestions}
            decisionTrees={decisionTrees}
            onRecommendation={setCurrentRecommendation}
          />
        </section>
      </main>

      {/* Matching Doctors & Nearby Hospitals Section */}
      {currentRecommendation && (
        <section className="doctors-triage-section" ref={doctorsSectionRef}>
          <div className="doctors-section-container">
            <div className="doctors-section-header">
              <div className="header-icon-badge">
                <LuStethoscope size={24} />
              </div>
              <div className="header-text-group">
                <div className="header-tag">Clinical Referrals & Nearby Hospitals</div>
                <h2>
                  {isFallback 
                    ? `Recommended Physicians for ${currentRecommendation.department} Triage` 
                    : `Specialists in ${currentRecommendation.department}`}
                </h2>
                <p>Consult with verified partner doctors and nearby hospitals</p>
              </div>

              {/* GPS Proximity Control */}
              <div className="location-control-pill">
                {locatingNearby ? (
                  <span className="locating-text">
                    <LuCompass className="spinning-compass" size={15} /> Locating nearest clinics...
                  </span>
                ) : locationStatus === 'granted' ? (
                  <button 
                    className="gps-refresh-btn" 
                    onClick={() => fetchNearbyDoctors(currentRecommendation.department)}
                    title="Refresh GPS Proximity"
                  >
                    <LuNavigation size={14} />
                    <span>GPS Radius Active</span>
                  </button>
                ) : (
                  <button 
                    className="gps-enable-btn"
                    onClick={() => fetchNearbyDoctors(currentRecommendation.department)}
                  >
                    <LuNavigation size={14} />
                    <span>Sort by Nearest Distance</span>
                  </button>
                )}
              </div>
            </div>

            {/* Distance & Insurance Filters */}
            <div className="doctor-filters-bar">
              <div className="filter-group">
                <LuFilter size={14} className="filter-group-icon" />
                <span className="filter-label">Radius:</span>
                {[5, 10, 15, 25, 50].map((km) => (
                  <button
                    key={km}
                    className={`radius-pill ${selectedRadius === km ? 'active' : ''}`}
                    onClick={() => setSelectedRadius(km)}
                  >
                    {km} km
                  </button>
                ))}
              </div>
              <div className="filter-group filter-group-insurance">
                <LuShield size={14} className="filter-group-icon" />
                <span className="filter-label">Insurance:</span>
                <select
                  className="insurance-select"
                  value={selectedInsurance}
                  onChange={(e) => setSelectedInsurance(e.target.value)}
                >
                  <option value="all">All Insurances</option>
                  {insuranceProviders.map((p) => (
                    <option key={p._id || p.name} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fallback Notice when direct specialist isn't listed */}
            {isFallback && (
              <div className="fallback-notice-banner">
                <div className="notice-icon">
                  <LuInfo size={20} />
                </div>
                <div className="notice-content">
                  <strong>Specialty Directory Notice</strong>
                  <p>{fallbackMessage || `No direct ${currentRecommendation.department} specialists are currently registered online. Our General Medicine physicians are ready to perform baseline clinical triage, diagnostic screening, and formal hospital referrals.`}</p>
                </div>
              </div>
            )}

            {/* Booking Success Notification */}
            {bookedAppointment && (
              <div className="booking-success-card">
                <LuCircleCheck size={24} className="success-icon" />
                <div className="success-details">
                  <h4>Appointment Confirmed!</h4>
                  <p>
                    Your consultation for <strong>{bookedAppointment.date?.split('T')[0] || bookedAppointment.date}</strong> at <strong>{bookedAppointment.timeSlot}</strong> has been saved.
                  </p>
                  <div className="success-actions">
                    <button 
                      className="view-dashboard-btn"
                      onClick={() => navigate('/dashboard/patient')}
                    >
                      <LuCalendar size={15} />
                      <span>View in Patient Dashboard</span>
                    </button>
                    <button 
                      className="dismiss-btn"
                      onClick={() => setBookedAppointment(null)}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}

            {loadingDoctors ? (
              <div className="doctors-loading-state">
                <div className="spinner"></div>
                <p>Retrieving verified physicians and partner hospitals...</p>
              </div>
            ) : hasNearbyResults ? (
              /* Grouped by Location Radius */
              <div className="nearby-radius-groups">
                {Object.entries(BUCKET_LABELS).map(([bucketKey, bucketInfo]) => {
                  const list = nearbyGroups[bucketKey] || [];
                  if (list.length === 0) return null;

                  return (
                    <div key={bucketKey} className="radius-tier-group">
                      <div className="radius-tier-header">
                        <span className="radius-tier-icon">{bucketInfo.icon}</span>
                        <div className="radius-tier-title-wrap">
                          <h3>{bucketInfo.title}</h3>
                          <span className="radius-tier-desc">{bucketInfo.desc} • {list.length} doctor{list.length > 1 ? 's' : ''}</span>
                        </div>
                      </div>

                      <div className="doctors-grid">
                        {list.map(doc => renderDoctorCard(doc))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : doctors.length > 0 ? (
              /* Fallback Standard Doctors Grid (when location radius is unavailable or idle) */
              <div className="doctors-grid">
                {doctors.map(doc => renderDoctorCard(doc))}
              </div>
            ) : (
              <div className="no-doctors-card">
                <p>
                  No registered practitioners are currently listed specifically under <strong>{currentRecommendation.department}</strong>.
                </p>
                <p className="no-doctors-hint">
                  You can consult our <strong>General Medicine</strong> practitioners for an initial clinical evaluation and referral.
                </p>
                <button 
                  className="fallback-btn" 
                  onClick={() => navigate('/appointments')}
                >
                  <LuCalendar size={16} />
                  <span>View All Doctors & Clinics</span>
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Clean Safety Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <p>
            <strong>Medical Disclaimer:</strong> talk2doc clinical triage provides educational guidance and department recommendations. It is not an alternative to emergency medical diagnosis. If experiencing sudden chest pain, loss of consciousness, or breathing difficulty, immediately dial <strong>108 / 112</strong> or proceed to the nearest emergency department.
          </p>
        </div>
      </footer>
    </div>
  );
}
