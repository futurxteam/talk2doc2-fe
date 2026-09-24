import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import API_BASE_URL from "../config";
import {
  LuCalendar,
  LuClock,
  LuUser,
  LuMapPin,
  LuPhone,
  LuCreditCard,
  LuCheck,
  LuCircleCheck,
  LuCopy,
  LuSearch,
  LuArrowLeft,
  LuRefreshCw,
  LuSparkles,
  LuX,
  LuStethoscope,
  LuShieldCheck,
  LuPhoneCall,
  LuCircleAlert,
  LuBuilding2,
  LuInfo,
} from "react-icons/lu";
import "./style/myAppointments.css";

export default function MyAppointments() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialPhone =
    queryParams.get("phone") ||
    localStorage.getItem("talk2doc_caller_phone") ||
    "";

  const [phone, setPhone] = useState(initialPhone);
  const [searchedPhone, setSearchedPhone] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'upcoming', 'completed'

  const fetchBookings = async (searchNumber) => {
    const cleanNumber = (searchNumber || "").trim();
    if (!cleanNumber) {
      setError("Please enter your mobile phone number.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSearchedPhone(cleanNumber);
      setHasSearched(true);

      // Save for convenience
      localStorage.setItem("talk2doc_caller_phone", cleanNumber);

      const res = await fetch(
        `${API_BASE_URL}/api/appointments/by-phone?phone=${encodeURIComponent(cleanNumber)}`
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load appointments");
      }

      setAppointments(data.appointments || []);
    } catch (err) {
      console.error("Fetch appointments error:", err);
      setError(err.message || "Could not retrieve appointments");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialPhone) {
      fetchBookings(initialPhone);
    }
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings(phone);
  };

  const handleClearPhone = () => {
    setPhone("");
    setError("");
  };

  const copyBookingRef = (id) => {
    const refCode = `#${String(id).slice(-8).toUpperCase()}`;
    navigator.clipboard?.writeText(refCode).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Helper to format date cleanly
  const formatApptDate = (dateStr) => {
    if (!dateStr) return "Scheduled Date";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Filter appointments if user toggles filter
  const filteredAppointments = appointments.filter((a) => {
    if (activeFilter === "all") return true;
    const status = (a.status || "").toLowerCase();
    if (activeFilter === "completed") {
      return status.includes("complete") || status.includes("done");
    }
    if (activeFilter === "upcoming") {
      return !status.includes("complete") && !status.includes("cancel");
    }
    return true;
  });

  return (
    <div className="appointments-page">
      {/* Top Mobile-Friendly Nav Bar */}
      <nav className="appointments-nav-bar">
        <div className="nav-inner">
          <Link to="/voice" className="nav-back-btn" aria-label="Back to Voice Line">
            <LuArrowLeft className="icon" />
            <span className="back-text">Back</span>
          </Link>

          <div className="nav-brand">
            <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", gap: 10 }}>
              <img
                src="/logo.jpg"
                alt="MyDoktor 24/7"
                style={{
                  height: 34,
                  borderRadius: 8,
                  background: "#ffffff",
                  padding: "2px 6px",
                  objectFit: "contain",
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
                  border: "1px solid rgba(0, 0, 0, 0.06)",
                }}
              />
              <div className="brand-text-group">
                <span className="brand-title">MyDoktor 24/7</span>
                <span className="brand-sub">My Bookings</span>
              </div>
            </Link>
          </div>

          <Link to="/voice" className="nav-voice-pill">
            <span className="pulse-dot"></span>
            <LuPhoneCall className="voice-icon" />
            <span className="voice-text">24/7 AI</span>
          </Link>
        </div>
      </nav>

      <main className="appointments-container">
        {/* Header Hero */}
        <header className="appointments-hero">
          <div className="hero-pill">
            <LuSparkles className="hero-pill-icon" />
            <span>AI Verified Doctor Bookings</span>
          </div>
          <h1>My Appointments</h1>
          <p>
            Lookup and verify your confirmed doctor consultations booked via{" "}
            <strong>Meera AI Voice</strong> .
          </p>
        </header>

        {/* Public Phone Lookup Form */}
        <section className="phone-lookup-card">
          <form onSubmit={handleSearchSubmit} className="lookup-form">
            <label htmlFor="patient-phone-input" className="input-label">
              <span>Mobile Phone Number</span>
              <span className="input-label-badge">No login required</span>
            </label>

            <div className="phone-input-wrapper">
              <div className="phone-prefix">
                <LuPhone className="input-icon" />
                <span className="prefix-text">+91</span>
              </div>
              <input
                id="patient-phone-input"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Enter 10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                className="phone-field"
                aria-label="Mobile phone number"
              />
              {phone && (
                <button
                  type="button"
                  className="btn-clear-input"
                  onClick={handleClearPhone}
                  aria-label="Clear input"
                >
                  <LuX />
                </button>
              )}
              <button
                type="submit"
                className="btn-search-appointments"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LuRefreshCw className="spin-icon" />
                    <span>Searching…</span>
                  </>
                ) : (
                  <>
                    <LuSearch />
                    <span>Find Bookings</span>
                  </>
                )}
              </button>
            </div>

            <div className="phone-hint">
              <LuInfo className="hint-icon" />
              <span>
                Enter the mobile number provided during your call with <strong>Meera AI</strong>.
              </span>
            </div>
          </form>

          {error && (
            <div className="error-alert">
              <LuCircleAlert className="error-icon" />
              <div className="error-msg">{error}</div>
            </div>
          )}
        </section>

        {/* Results Section */}
        {hasSearched && (
          <section className="results-wrapper">
            <div className="results-toolbar">
              <div className="toolbar-info">
                <div className="results-title">
                  <span>Results for</span>
                  <span className="highlight-phone">{searchedPhone}</span>
                  <span className="count-pill">{appointments.length}</span>
                </div>
                {appointments.length > 0 && (
                  <div className="live-status-pill">
                    <span className="status-dot"></span>
                    <span>Live Verified</span>
                  </div>
                )}
              </div>

              {appointments.length > 0 && (
                <div className="toolbar-actions">
                  <div className="filter-chips">
                    <button
                      type="button"
                      className={`filter-chip ${activeFilter === "all" ? "active" : ""}`}
                      onClick={() => setActiveFilter("all")}
                    >
                      All ({appointments.length})
                    </button>
                    <button
                      type="button"
                      className={`filter-chip ${activeFilter === "upcoming" ? "active" : ""}`}
                      onClick={() => setActiveFilter("upcoming")}
                    >
                      Upcoming
                    </button>
                    <button
                      type="button"
                      className={`filter-chip ${activeFilter === "completed" ? "active" : ""}`}
                      onClick={() => setActiveFilter("completed")}
                    >
                      Completed
                    </button>
                  </div>

                  <button
                    type="button"
                    className="btn-refresh"
                    onClick={() => fetchBookings(searchedPhone)}
                    disabled={loading}
                    title="Refresh bookings"
                    aria-label="Refresh bookings"
                  >
                    <LuRefreshCw className={loading ? "spin-icon" : ""} />
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="loading-skeleton-list">
                {[1, 2].map((n) => (
                  <div key={n} className="skeleton-card">
                    <div className="skeleton-row header-skel">
                      <div className="skeleton-avatar"></div>
                      <div className="skeleton-lines">
                        <div className="skel-line w-60"></div>
                        <div className="skel-line w-40"></div>
                      </div>
                    </div>
                    <div className="skeleton-grid">
                      <div className="skel-box"></div>
                      <div className="skel-box"></div>
                      <div className="skel-box"></div>
                      <div className="skel-box"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="empty-appointments">
                <div className="empty-icon-wrap">
                  <LuCalendar className="empty-icon" />
                </div>
                <h3>
                  {appointments.length === 0
                    ? "No Appointments Found"
                    : "No Bookings in this Filter"}
                </h3>
                <p>
                  {appointments.length === 0 ? (
                    <>
                      We couldn't locate any confirmed appointments registered for{" "}
                      <strong>{searchedPhone}</strong>. If you recently spoke with Meera AI,
                      ensure your booking was completed or place a quick call.
                    </>
                  ) : (
                    "There are no appointments matching the selected filter."
                  )}
                </p>

                <div className="empty-actions">
                  <Link to="/voice" className="btn-empty-voice">
                    <LuPhoneCall />
                    <span>Dial 24/7 AI Voice Line</span>
                  </Link>
                  <Link to="/" className="btn-empty-secondary">
                    Return to Home
                  </Link>
                </div>
              </div>
            ) : (
              <div className="appointments-list">
                {filteredAppointments.map((a) => {
                  let rawDoctorName = a.doctorId?.fullName || "Specialist Doctor";
                  const doctorName = rawDoctorName.startsWith("Dr.")
                    ? rawDoctorName
                    : `Dr. ${rawDoctorName}`;
                  const specialty = a.doctorId?.specialization || "General Physician";
                  const clinicName =
                    a.doctorId?.hospitalId?.name || a.hospitalId?.name || "Partner Clinic";
                  const clinicAddress =
                    a.doctorId?.hospitalId?.address ||
                    a.doctorId?.hospitalId?.city ||
                    a.hospitalId?.address ||
                    "";
                  const clinicPhone =
                    a.doctorId?.hospitalId?.phone || a.hospitalId?.phone || "";
                  const fee = a.doctorId?.consultationFee
                    ? `₹${a.doctorId.consultationFee}`
                    : "Standard Fee";
                  const refCode = `#${String(a._id).slice(-8).toUpperCase()}`;
                  const isCopied = copiedId === a._id;
                  const isPaid = (a.paymentStatus || "").toLowerCase() === "paid";
                  const isConfirmed =
                    (a.status || "").toLowerCase() === "confirmed" ||
                    (a.status || "").toLowerCase() === "approved";

                  return (
                    <article key={a._id} className="appointment-card">
                      {/* Card Header */}
                      <div className="card-top">
                        <div className="doctor-header-group">
                          <div className="doctor-avatar">
                            <LuStethoscope />
                          </div>
                          <div className="card-doctor-info">
                            <div className="doctor-name-row">
                              <h3>{doctorName}</h3>
                              <span className="card-doctor-spec">{specialty}</span>
                            </div>

                            <div className="card-clinic-name">
                              <LuMapPin className="pin-icon" />
                              <span>{clinicName}</span>
                              {clinicAddress && (
                                <span className="clinic-addr-sub">
                                  ({clinicAddress})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="status-badge-wrapper">
                          <span
                            className={`card-status-badge ${isConfirmed ? "confirmed" : "pending"
                              }`}
                          >
                            <LuCircleCheck className="badge-icon" />
                            <span>{a.status || "Confirmed"}</span>
                          </span>
                        </div>
                      </div>

                      {/* Card Details Grid */}
                      <div className="card-grid">
                        <div className="card-field highlight-field">
                          <span className="card-field-label">
                            <LuCalendar className="f-icon" /> Date & Slot
                          </span>
                          <div className="card-field-val date-val">
                            <span className="date-text">{formatApptDate(a.date)}</span>
                            <span className="slot-pill">
                              <LuClock className="clock-icon" /> {a.timeSlot || "Standard Slot"}
                            </span>
                          </div>
                        </div>

                        <div className="card-field">
                          <span className="card-field-label">
                            <LuUser className="f-icon" /> Patient
                          </span>
                          <span className="card-field-val">
                            {a.patientId?.name || "Patient"}
                            {a.patientId?.gender || a.patientId?.age ? (
                              <span className="patient-meta">
                                {" "}
                                • {[a.patientId?.gender, a.patientId?.age ? `${a.patientId.age} yrs` : null]
                                  .filter(Boolean)
                                  .join(", ")}
                              </span>
                            ) : null}
                          </span>
                          <span className="card-field-sub">
                            {a.patientId?.phone || searchedPhone}
                          </span>
                        </div>

                        <div className="card-field">
                          <span className="card-field-label">
                            <LuCreditCard className="f-icon" /> Consultation Fee
                          </span>
                          <span className="card-field-val fee-val">{fee}</span>
                          <span className="card-field-sub">
                            Mode: {a.paymentMode || "Pay at Clinic"}
                          </span>
                        </div>

                        <div className="card-field">
                          <span className="card-field-label">Payment Status</span>
                          <span
                            className={`payment-status-pill ${isPaid ? "paid" : "pending"
                              }`}
                          >
                            <span className="dot"></span>
                            {a.paymentStatus || "Pending (At Clinic)"}
                          </span>
                        </div>
                      </div>

                      {/* Clinic Contact & Direct Mobile Actions */}
                      {clinicPhone && (
                        <div className="card-contact-row">
                          <span className="contact-label">Clinic Helpdesk:</span>
                          <a
                            href={`tel:${clinicPhone}`}
                            className="btn-call-clinic"
                            aria-label={`Call ${clinicName}`}
                          >
                            <LuPhone />
                            <span>{clinicPhone}</span>
                          </a>
                        </div>
                      )}

                      {/* Card Footer */}
                      <div className="card-footer">
                        <div className="ref-wrapper">
                          <span className="ref-label">Booking ID:</span>
                          <button
                            type="button"
                            className="ref-copy-btn"
                            onClick={() => copyBookingRef(a._id)}
                            title="Click to copy booking code"
                            aria-label="Copy booking reference"
                          >
                            <span className="ref-code">{refCode}</span>
                            {isCopied ? (
                              <span className="copied-badge">
                                <LuCheck /> Copied
                              </span>
                            ) : (
                              <LuCopy className="copy-icon" />
                            )}
                          </button>
                        </div>

                        {a.createdAt && (
                          <div className="registered-date">
                            <span>Booked on {new Date(a.createdAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
