import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCurrentUser,
  createOrUpdatePatientProfile,
  getPatientProfile,
  getMyAssessments
} from "../api/usersApi";
import { getInsuranceProviders } from "./api";
// or "../api/usersApi" depending where you put it

import Sidebar from "../components/Sidebar";
import "./style/PatientDashboard.css";
import { getMyAppointments } from "../api/usersApi";

function PatientDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("interview");
  const [user, setUser] = useState(null);
  const [insuranceProviders, setInsuranceProviders] = useState([]);

  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  useEffect(() => {
    getInsuranceProviders()
      .then((res) => {
        if (res.success) {
          setInsuranceProviders(res.providers || []);
        }
      })
      .catch((err) => {
        console.error("Failed to load insurance providers", err);
      });
  }, []);

  const loadHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await getMyAssessments();
      setHistory(res.assessments || []);
    } catch (e) {
      console.error("Failed to load history", e);
    } finally {
      setHistoryLoading(false);
    }
  };

  const [profile, setProfile] = useState({
    fullName: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    bloodGroup: "",
    allergies: [],
    chronicDiseases: [],
    medications: [],
    emergencyContactName: "",
    emergencyContactPhone: "",
    insuranceProvider: "",   // ✅ ADD THIS
  });

  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const loadAppointments = async () => {
    try {
      setAppointmentsLoading(true);
      const res = await getMyAppointments();
      setAppointments(res.appointments || []);
    } catch (e) {
      console.error("Failed to load appointments", e);
    } finally {
      setAppointmentsLoading(false);
    }
  };
  useEffect(() => {
    if (activeSection === "appointments") {
      loadAppointments();
    }
  }, [activeSection]);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate("/login");
      return;
    }
    setUser(currentUser);

    // Load existing profile if available
    loadProfile(currentUser.id);
    loadHistory(); // ✅ add this
  }, [navigate]);

  const loadProfile = async (userId) => {
    try {
      const res = await getPatientProfile(userId);

      if (res.profile) {
        setProfile({
          fullName: res.profile.fullName || "",
          age: res.profile.age || "",
          gender: res.profile.gender || "",
          height: res.profile.height || "",
          weight: res.profile.weight || "",
          bloodGroup: res.profile.bloodGroup || "",
          allergies: res.profile.allergies || [],
          chronicDiseases: res.profile.chronicDiseases || [],
          medications: res.profile.medications || [],
          emergencyContactName: res.profile.emergencyContactName || "",
          emergencyContactPhone: res.profile.emergencyContactPhone || "",
          insuranceProvider: res.profile.insuranceProvider || "",
        });
      }
    } catch (err) {
      console.log("Failed to load profile", err);
    }
  };



  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleArrayChange = (e, field) => {
    const value = e.target.value;
    setProfile({ ...profile, [field]: value.split(",").map((v) => v.trim()) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createOrUpdatePatientProfile(profile);
      alert("Profile saved successfully!");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (

    <div className="pd-container">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        user={profile}
        onLogout={handleLogout}
        onStartInterview={() => navigate("/interview")}
      />

      <main className="pd-main">
        {activeSection === "interview" ? (
          <div className="pd-interview-card">
  <div className="pd-particles">
  {Array.from({ length: 20 }).map((_, i) => (
    <span 
      key={i} 
      className="pd-particle"
      style={{
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${6 + Math.random() * 10}s`
      }}
    ></span>
  ))}
</div>

  <div className="pd-interview-content">
    <span className="pd-tag">Assess your symptoms</span>
    <h2>Analyze Your Symptoms with AI</h2>
    <p>Get a preliminary diagnosis and recommendations instantly.</p>
    <button className="pd-btn-interview" onClick={() => navigate("/interview")}>
      Start Interview
    </button>
  </div>

  <div className="pd-interview-img"></div>
</div>

        ) : activeSection === "history" ? (
          <div className="pd-section">
            <h2>Diagnosis History</h2>

            {historyLoading && <p>Loading history...</p>}

            {!historyLoading && history.length === 0 && (
              <p className="muted">No diagnosis history yet.</p>
            )}

            {!historyLoading && history.map((item) => (
              <div key={item._id} className="pd-history-card">
                <div className="pd-history-header">
                  <span className="date">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>

                  {item.emergency ? (
                    <span className="pd-status pd-status-danger">Emergency</span>
                  ) : (
                    <span className="pd-status pd-status-success">Completed</span>
                  )}
                </div>

                <h3>
                  {item.primarySymptom ||
                    item.results?.[0]?.name
                      ?.replace(/_/g, " ")
                      ?.toUpperCase() ||
                    "Clinical Assessment"}
                </h3>

                <div className="pd-report-content" style={{ marginTop: 12, fontSize: '0.9rem', color: '#334155' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '8px', marginBottom: '12px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Recommended Specialty</span>
                      <strong style={{ color: '#0284c7' }}>{item.department || item.recommendation || "General Medicine"}</strong>
                    </div>
                    {item.alternativeDepartment && (
                      <div>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Alternative</span>
                        <span>{item.alternativeDepartment}</span>
                      </div>
                    )}
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Urgency Level</span>
                      <span style={{ 
                        display: 'inline-block', 
                        padding: '2px 8px', 
                        borderRadius: '4px', 
                        fontSize: '0.75rem', 
                        fontWeight: 600,
                        background: item.emergency || item.urgencyLevel === 'EMERGENCY' ? '#fee2e2' : item.urgencyLevel === 'URGENT' || item.urgencyLevel === 'PRIORITY' ? '#fef3c7' : '#e0f2fe',
                        color: item.emergency || item.urgencyLevel === 'EMERGENCY' ? '#dc2626' : item.urgencyLevel === 'URGENT' || item.urgencyLevel === 'PRIORITY' ? '#b45309' : '#0369a1'
                      }}>
                        {item.urgencyLevel || (item.emergency ? 'EMERGENCY' : 'ROUTINE')}
                      </span>
                    </div>
                    {(item.duration || item.collected?.duration) && (
                      <div>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Duration</span>
                        <span>{item.duration || item.collected?.duration}</span>
                      </div>
                    )}
                    {(item.severity || item.collected?.severity) && (
                      <div>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Severity</span>
                        <span style={{ textTransform: 'capitalize' }}>{item.severity || item.collected?.severity}</span>
                      </div>
                    )}
                  </div>

                  {(item.collected?.clinicalSummary || item.reportData?.reason) && (
                    <div style={{ marginBottom: '10px' }}>
                      <strong style={{ fontSize: '0.8rem', color: '#475569' }}>Clinical Indication:</strong>
                      <p style={{ margin: '4px 0', color: '#334155', lineHeight: '1.4', fontSize: '0.85rem' }}>
                        {item.collected?.clinicalSummary || item.reportData?.reason}
                      </p>
                    </div>
                  )}

                  {(item.collected?.advice || item.reportData?.advice) && (
                    <div style={{ marginBottom: '10px', background: '#f0fdf4', padding: '10px 14px', borderRadius: '6px', borderLeft: '3px solid #22c55e' }}>
                      <strong style={{ fontSize: '0.8rem', color: '#166534' }}>Guidance & Patient Advice:</strong>
                      <p style={{ margin: '4px 0', color: '#15803d', fontSize: '0.85rem', lineHeight: '1.4' }}>
                        {item.collected?.advice || item.reportData?.advice}
                      </p>
                    </div>
                  )}
                </div>

                <details style={{ marginTop: 10 }}>
                  <summary style={{ cursor: 'pointer', color: '#0284c7', fontSize: '0.8rem', fontWeight: 600 }}>View Raw Assessment Record</summary>
                  <pre style={{ fontSize: 11, background: '#f1f5f9', padding: '10px', borderRadius: '6px', overflowX: 'auto', marginTop: '6px' }}>
                    {JSON.stringify(item, null, 2)}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        ) : activeSection === "appointments" ? (
          /* ===== APPOINTMENTS ===== */
          <div className="pd-section">
            <h2>My Appointments</h2>

            {appointmentsLoading && <p>Loading appointments...</p>}

            {!appointmentsLoading && appointments.length === 0 && (
              <p className="muted">No appointments yet.</p>
            )}

            {!appointmentsLoading && appointments.map((a) => (
              <div
                key={a._id}
                style={{
                  border: "1px solid #ddd",
                  padding: 12,
                  marginBottom: 12,
                  borderRadius: 6,
                }}
              >
                <p><b>Doctor:</b> {a.doctorId?.fullName}</p>
                <p><b>Specialization:</b> {a.doctorId?.specialization}</p>
                <p><b>Date:</b> {a.date}</p>
                <p><b>Time:</b> {a.timeSlot}</p>
                <p><b>Status:</b> {a.status}</p>
                <p><b>Payment:</b> {a.paymentStatus} ({a.paymentMode})</p>
              </div>
            ))}
          </div>

        ) : (

          <>
            <div className="pd-welcome-card">
              <h2>Welcome, {profile.fullName || "User"}!</h2>
              <p>Manage your health profile below</p>
            </div>

            <form className="pd-profile-form" onSubmit={handleSubmit}>
              <h3>Personal Information</h3>

              <div className="pd-form-row">
                <div className="pd-form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={profile.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="pd-form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    name="age"
                    value={profile.age}
                    onChange={handleChange}
                    placeholder="Enter your age"
                  />
                </div>
              </div>

              <div className="pd-form-row">
                <div className="pd-form-group">
                  <label>Gender</label>
                  <select name="gender" value={profile.gender} onChange={handleChange}>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="pd-form-group">
                  <label>Blood Group</label>
                  <input
                    type="text"
                    name="bloodGroup"
                    value={profile.bloodGroup}
                    onChange={handleChange}
                    placeholder="e.g., A+, O-, B+"
                  />
                </div>
              </div>
              <select
                name="insuranceProvider"
                value={profile.insuranceProvider}
                onChange={handleChange}
                className="pd-select"
              >
                <option value="">Select Insurance Provider</option>

                {insuranceProviders.map((p) => (
                  <option key={p._id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>

              <h3>Physical Information</h3>

              <div className="pd-form-row">
                <div className="pd-form-group">
                  <label>Height (cm)</label>
                  <input
                    type="number"
                    name="height"
                    value={profile.height}
                    onChange={handleChange}
                    placeholder="Enter height in cm"
                  />
                </div>

                <div className="pd-form-group">
                  <label>Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    value={profile.weight}
                    onChange={handleChange}
                    placeholder="Enter weight in kg"
                  />
                </div>
              </div>

              <h3>Medical Information</h3>

              <div className="pd-form-group">
                <label>Allergies (comma-separated)</label>
                <input
                  type="text"
                  value={profile.allergies.join(", ")}
                  onChange={(e) => handleArrayChange(e, "allergies")}
                  placeholder="e.g., Peanuts, Penicillin"
                />
              </div>

              <div className="pd-form-group">
                <label>Chronic Diseases (comma-separated)</label>
                <input
                  type="text"
                  value={profile.chronicDiseases.join(", ")}
                  onChange={(e) => handleArrayChange(e, "chronicDiseases")}
                  placeholder="e.g., Diabetes, Hypertension"
                />
              </div>

              <div className="pd-form-group">
                <label>Current Medications (comma-separated)</label>
                <input
                  type="text"
                  value={profile.medications.join(", ")}
                  onChange={(e) => handleArrayChange(e, "medications")}
                  placeholder="e.g., Aspirin, Metformin"
                />
              </div>

              <h3>Emergency Contact</h3>

              <div className="pd-form-row">
                <div className="pd-form-group">
                  <label>Emergency Contact Name</label>
                  <input
                    type="text"
                    name="emergencyContactName"
                    value={profile.emergencyContactName}
                    onChange={handleChange}
                    placeholder="Contact person name"
                  />
                </div>

                <div className="pd-form-group">
                  <label>Emergency Contact Phone</label>
                  <input
                    type="tel"
                    name="emergencyContactPhone"
                    value={profile.emergencyContactPhone}
                    onChange={handleChange}
                    placeholder="Contact phone number"
                  />
                </div>
              </div>

              <button type="submit" className="pd-btn-primary" disabled={loading}>
                {loading ? "Saving..." : "Save Profile"}
              </button>
            </form>
          </>
        )}
      </main>
    </div>

  );
}

export default PatientDashboard;
