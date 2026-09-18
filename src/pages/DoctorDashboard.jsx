import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCurrentUser, getDoctorProfile, createOrUpdateDoctorProfile, getDoctorAppointments,
  updateAppointmentStatus,
} from "../api/usersApi";
import "./style/DoctorDashboard.css";

function DoctorDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("appointments"); // appointments | profile
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [apptType, setApptType] = useState("upcoming"); // upcoming | past
  const [filterDate, setFilterDate] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [profile, setProfile] = useState({
    fullName: "",
    specialization: "",
    licenseNumber: "",
    yearsOfExperience: "",
    qualifications: [],
    consultationFee: "",
    availability: "",
    email: "",
    phone: "",
    bio: "",
    languages: [],

    // 🆕 Slot system
    workingHours: {
      start: "09:00",
      end: "17:00",
      days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    },
    slotDuration: 30,
  });


  useEffect(() => {
    const currentUser = getCurrentUser();

    // No token → go to login
    if (!currentUser) {
      navigate("/login");
      return;
    }

    // Token exists but not a doctor → block
    if (currentUser.role !== "DOCTOR") {
      navigate("/"); // or /unauthorized
      return;
    }

    setUser(currentUser);
    loadProfile();
  }, [navigate]);
  const loadAppointments = async () => {
    const res = await getDoctorAppointments({
      type: apptType,
      date: filterDate,
    });
    setAppointments(res.appointments || []);
  };
  useEffect(() => {
    if (activeSection === "appointments") {
      loadAppointments();
    }
  }, [activeSection, apptType, filterDate]);


  const loadProfile = async () => {
    try {
      const res = await getDoctorProfile();
      if (res.profile) {
        setProfile({
          workingHours: res.profile.workingHours || {
            start: "09:00",
            end: "17:00",
            days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
          },
          slotDuration: res.profile.slotDuration || 30,

          fullName: res.profile.fullName || "",
          specialization: res.profile.specialization || "",
          licenseNumber: res.profile.licenseNumber || "",
          yearsOfExperience: res.profile.yearsOfExperience || "",
          qualifications: res.profile.qualifications || [],
          consultationFee: res.profile.consultationFee || "",
          availability: res.profile.availability || "",
          email: res.profile.email || "",
          phone: res.profile.phone || "",
          bio: res.profile.bio || "",
          languages: res.profile.languages || [],
        });
      }
    } catch (err) {
      alert("Profile not found. Contact hospital admin.");
    }
  };
  useEffect(() => {
    if (activeSection === "appointments") {
      loadAppointments();
    }
  }, [activeSection]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleArrayChange = (e, field) => {
    setProfile({
      ...profile,
      [field]: e.target.value.split(",").map(v => v.trim()),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createOrUpdateDoctorProfile(profile);
      alert("Profile updated");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const [selectedAppt, setSelectedAppt] = useState(null);

  useEffect(() => {
    // Reset selection when filter changes
    setSelectedAppt(null);
  }, [apptType, filterDate]);

  return (
    <div className="doc-dash-wrapper">
      <div className="doc-dash-container">

        <aside className={`doc-dash-sidebar ${isSidebarOpen ? "open" : ""}`}>
          <div className="doc-dash-sidebar-header">
            <div className="doc-dash-avatar">
            </div>
            <div className="doc-dash-name">
              <strong>{profile.fullName}</strong>
            </div>
            <button className="doc-dash-close-mobile" onClick={() => setIsSidebarOpen(false)}>✕</button>
          </div>

          <nav className="doc-dash-nav">
            <button
              className={`doc-dash-nav-link ${activeSection === "appointments" ? "active" : ""}`}
              onClick={() => { setActiveSection("appointments"); setIsSidebarOpen(false); }}
            >
              Appointments
            </button>
            <button
              className={`doc-dash-nav-link ${activeSection === "profile" ? "active" : ""}`}
              onClick={() => { setActiveSection("profile"); setIsSidebarOpen(false); }}
            >
              My Profile
            </button>
          </nav>
          <button
            className="doc-dash-logout"
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/");
            }}
          >
            Logout
          </button>

        </aside>

        <main className="doc-dash-main">
          <button className="doc-dash-mobile-toggle" onClick={() => setIsSidebarOpen(true)}>
            ☰ Menu
          </button>

          {isSidebarOpen && <div className="doc-dash-overlay" onClick={() => setIsSidebarOpen(false)} />}

          {activeSection === "appointments" ? (
            <div className="doc-dash-appt-layout">
              {/* LEFT: LIST */}
              <div className="doc-dash-appt-list-panel">
                <div className="doc-dash-appt-header">
                  <h2>Appointments</h2>
                  <div className="doc-dash-appt-filters">
                    <select value={apptType} onChange={(e) => setApptType(e.target.value)}>
                      <option value="upcoming">Upcoming</option>
                      <option value="past">Past</option>
                    </select>
                    <input
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                    />
                    {filterDate && <button className="doc-dash-clear-filter" onClick={() => setFilterDate("")}>✕</button>}
                  </div>
                </div>

                <div className="doc-dash-appt-list">
                  {appointments.length === 0 && <p className="doc-dash-no-data">No appointments found.</p>}
                  {appointments.map((a) => (
                    <div
                      key={a._id}
                      className={`doc-dash-appt-item ${selectedAppt?._id === a._id ? "selected" : ""}`}
                      onClick={() => setSelectedAppt(a)}
                    >
                      <div className="doc-dash-appt-time">{a.timeSlot}</div>
                      <div className="doc-dash-appt-info">
                        <strong>{a.patientId?.name || "Unknown Patient"}</strong>
                        <span className={`doc-dash-status-badge ${a.status.toLowerCase()}`}>{a.status}</span>
                      </div>
                      <div className="doc-dash-appt-date-small">{new Date(a.date).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT: DETAIL */}
              <div className="doc-dash-appt-detail-panel">
                {selectedAppt ? (
                  <div className="doc-dash-appt-detail-card">
                    <div className="doc-dash-detail-header">
                      <h3>Appointment Details</h3>
                      <span className={`doc-dash-status-badge large ${selectedAppt.status.toLowerCase()}`}>
                        {selectedAppt.status}
                      </span>
                    </div>

                    <div className="doc-dash-detail-body">
                      <div className="doc-dash-detail-row">
                        <label>Patient:</label>
                        <span>{selectedAppt.patientId?.name}</span>
                      </div>
                      <div className="doc-dash-detail-row">
                        <label>Date & Time:</label>
                        <span>{selectedAppt.date} at {selectedAppt.timeSlot}</span>
                      </div>
                      <div className="doc-dash-detail-row">
                        <label>Payment:</label>
                        <span>{selectedAppt.paymentStatus} ({selectedAppt.paymentMode})</span>
                      </div>
                    </div>

                    <div className="doc-dash-detail-actions">
                      {selectedAppt.status === "Pending" && (
                        <button
                          className="doc-dash-btn-action confirm"
                          onClick={() =>
                            updateAppointmentStatus({
                              appointmentId: selectedAppt._id,
                              status: "Confirmed",
                            }).then(() => { loadAppointments(); setSelectedAppt(null); })
                          }
                        >
                          Confirm
                        </button>
                      )}

                      {selectedAppt.status !== "Cancelled" && selectedAppt.status !== "Completed" && (
                        <button
                          className="doc-dash-btn-action cancel"
                          onClick={() =>
                            updateAppointmentStatus({
                              appointmentId: selectedAppt._id,
                              status: "Cancelled",
                            }).then(() => { loadAppointments(); setSelectedAppt(null); })
                          }
                        >
                          Cancel
                        </button>
                      )}

                      {selectedAppt.status === "Confirmed" && (
                        <button
                          className="doc-dash-btn-action complete"
                          onClick={() =>
                            updateAppointmentStatus({
                              appointmentId: selectedAppt._id,
                              status: "Completed",
                              paymentStatus: "Paid",
                            }).then(() => { loadAppointments(); setSelectedAppt(null); })
                          }
                        >
                          Mark Completed
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="doc-dash-empty-state">
                    <p>Select an appointment to view details</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="doc-dash-profile-section">
              <h2> {profile.fullName}'s Profile</h2>
              <form onSubmit={handleSubmit} className="doc-dash-form">
                <div className="doc-dash-form-grid">
                  <div className="doc-dash-input-group">
                    <label>Full Name</label>
                    <input name="fullName" value={profile.fullName} onChange={handleChange} />
                  </div>
                  <div className="doc-dash-input-group">
                    <label>Specialization</label>
                    <input name="specialization" value={profile.specialization} onChange={handleChange} />
                  </div>
                  <div className="doc-dash-input-group">
                    <label>License Number</label>
                    <input name="licenseNumber" value={profile.licenseNumber} onChange={handleChange} />
                  </div>
                  <div className="doc-dash-input-group">
                    <label>Experience (Years)</label>
                    <input name="yearsOfExperience" value={profile.yearsOfExperience} onChange={handleChange} />
                  </div>
                </div>

                <div className="doc-dash-input-group">
                  <label>Qualifications</label>
                  <input value={profile.qualifications.join(", ")} onChange={(e) => handleArrayChange(e, "qualifications")} />
                </div>

                <div className="doc-dash-form-grid">
                  <div className="doc-dash-input-group">
                    <label>Consultation Fee</label>
                    <input name="consultationFee" value={profile.consultationFee} onChange={handleChange} />
                  </div>
                  <div className="doc-dash-input-group">
                    <label>Availability</label>
                    <input name="availability" value={profile.availability} onChange={handleChange} />
                  </div>
                  <div className="doc-dash-input-group">
                    <label>Email</label>
                    <input name="email" value={profile.email} onChange={handleChange} />
                  </div>
                  <div className="doc-dash-input-group">
                    <label>Phone</label>
                    <input name="phone" value={profile.phone} onChange={handleChange} />
                  </div>
                </div>

                <div className="doc-dash-input-group">
                  <label>Bio</label>
                  <textarea name="bio" value={profile.bio} onChange={handleChange} rows={3} />
                </div>

                <div className="doc-dash-input-group">
                  <label>Languages</label>
                  <input value={profile.languages.join(", ")} onChange={(e) => handleArrayChange(e, "languages")} />
                </div>

                <h3>Working Hours</h3>
                <div className="doc-dash-form-grid">
                  <div className="doc-dash-input-group">
                    <label>Start Time</label>
                    <input
                      value={profile.workingHours.start}
                      onChange={(e) => setProfile({ ...profile, workingHours: { ...profile.workingHours, start: e.target.value } })}
                    />
                  </div>
                  <div className="doc-dash-input-group">
                    <label>End Time</label>
                    <input
                      value={profile.workingHours.end}
                      onChange={(e) => setProfile({ ...profile, workingHours: { ...profile.workingHours, end: e.target.value } })}
                    />
                  </div>
                  <div className="doc-dash-input-group">
                    <label>Slot Duration (min)</label>
                    <input
                      type="number"
                      value={profile.slotDuration}
                      onChange={(e) => setProfile({ ...profile, slotDuration: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="doc-dash-input-group">
                  <label>Working Days</label>
                  <input
                    value={profile.workingHours.days.join(", ")}
                    onChange={(e) => setProfile({ ...profile, workingHours: { ...profile.workingHours, days: e.target.value.split(",").map(d => d.trim()) } })}
                  />
                </div>

                <button className="doc-dash-btn-save" disabled={loading}>{loading ? "Saving..." : "Save Profile"}</button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default DoctorDashboard;
