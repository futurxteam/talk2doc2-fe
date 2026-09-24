import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import API_BASE_URL from "../config";
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

  return (
    <div className="appointments-page">
      <div className="appointments-container">
        {/* Header */}
        <div className="appointments-header">
          <h1>My Appointments</h1>
          <p>View your confirmed doctor bookings registered via voice or online</p>
        </div>

        {/* Public Phone Lookup Form (No login or token required) */}
        <div className="phone-lookup-card">
          <form onSubmit={handleSearchSubmit}>
            <label htmlFor="patient-phone-input">
              Enter your mobile phone number
            </label>
            <div className="phone-input-row">
              <input
                id="patient-phone-input"
                type="tel"
                placeholder="e.g. 7291502081 or 9847012345"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
              />
              <button
                type="submit"
                className="btn-search-appointments"
                disabled={loading}
              >
                {loading ? "Searching…" : "Find Bookings"}
              </button>
            </div>
            <div className="phone-hint">
              💡 Enter the same phone number you gave to Meera AI during your call.
            </div>
          </form>

          {error && (
            <p style={{ color: "#DC2626", fontSize: 13, marginTop: 12, fontWeight: 600 }}>
              ⚠️ {error}
            </p>
          )}
        </div>

        {/* Results Section */}
        {hasSearched && (
          <div>
            <div className="results-heading">
              <span>
                Bookings for <b>{searchedPhone}</b> ({appointments.length})
              </span>
              {appointments.length > 0 && (
                <span style={{ fontSize: 13, color: "#2FBF71", fontWeight: 700 }}>
                  ● Live Verified
                </span>
              )}
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#527568" }}>
                <p>Loading your appointments…</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="empty-appointments">
                <div className="empty-icon">📅</div>
                <h3>No Appointments Found</h3>
                <p>
                  We couldn't find any confirmed appointments registered for{" "}
                  <b>{searchedPhone}</b>. If you just placed a call with Meera AI, make
                  sure the booking was confirmed.
                </p>
                <Link to="/voice" className="btn-book-voice">
                  🎙️ Dial 24/7 AI Voice Line
                </Link>
              </div>
            ) : (
              <div className="appointments-list">
                {appointments.map((a) => {
                  const doctorName = a.doctorId?.fullName || "Specialist Doctor";
                  const specialty = a.doctorId?.specialization || "General Physician";
                  const clinicName =
                    a.doctorId?.hospitalId?.name || a.hospitalId?.name || "Kochi Partner Clinic";
                  const clinicPhone =
                    a.doctorId?.hospitalId?.phone || a.hospitalId?.phone || "";
                  const fee = a.doctorId?.consultationFee
                    ? `₹${a.doctorId.consultationFee}`
                    : "Standard Fee";

                  return (
                    <div key={a._id} className="appointment-card">
                      <div className="card-top">
                        <div className="card-doctor-info">
                          <h3>{doctorName}</h3>
                          <span className="card-doctor-spec">{specialty}</span>
                          <div className="card-clinic-name">
                            📍 {clinicName} {clinicPhone ? `· ${clinicPhone}` : ""}
                          </div>
                        </div>

                        <span className="card-status-badge">
                          ✓ {a.status || "Confirmed"}
                        </span>
                      </div>

                      <div className="card-grid">
                        <div className="card-field">
                          <span className="card-field-label">Date & Time</span>
                          <span className="card-field-val">
                            🗓️ {a.date} @ {a.timeSlot}
                          </span>
                        </div>

                        <div className="card-field">
                          <span className="card-field-label">Patient</span>
                          <span className="card-field-val">
                            👤 {a.patientId?.name || "Patient"} ({a.patientId?.phone || searchedPhone})
                          </span>
                        </div>

                        <div className="card-field">
                          <span className="card-field-label">Consultation Fee</span>
                          <span className="card-field-val">
                            💳 {fee} ({a.paymentMode || "Pay at Clinic"})
                          </span>
                        </div>

                        <div className="card-field">
                          <span className="card-field-label">Payment Status</span>
                          <span
                            className="card-field-val"
                            style={{
                              color: a.paymentStatus === "Paid" ? "#059669" : "#D97706",
                            }}
                          >
                            ● {a.paymentStatus || "Pending (At Clinic)"}
                          </span>
                        </div>
                      </div>

                      <div className="card-footer">
                        <span>
                          Booking Ref:{" "}
                          <span className="ref-number">
                            #{String(a._id).slice(-8).toUpperCase()}
                          </span>
                        </span>
                        <span>
                          {a.createdAt
                            ? `Registered: ${new Date(a.createdAt).toLocaleDateString()}`
                            : ""}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
