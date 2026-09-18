import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCurrentUser, addDoctorByHospital, getHospitalDoctors, getHospitalProfile,
  createOrUpdateHospitalProfile, getHospitalAppointments, updateAppointmentStatus
} from "../api/usersApi";
import "./style/Hospitaldash.css"; // Reusing existing styles for now
import { getInsuranceProviders } from "./api";



function HospitalDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("overview");
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [insuranceProviders, setInsuranceProviders] = useState([]);


  const [appointmentsLoading, setAppointmentsLoading] = useState(false);

  const [doctors, setDoctors] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(appointments.length / ITEMS_PER_PAGE);

  const paginatedAppointments = appointments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const [loading, setLoading] = useState(false);
  const loadAppointments = async () => {
    try {
      setAppointmentsLoading(true);
      const res = await getHospitalAppointments();

      const list = (res.appointments || []).sort((a, b) => {
        const d1 = new Date(`${a.date} ${a.timeSlot.split("-")[0]}`);
        const d2 = new Date(`${b.date} ${b.timeSlot.split("-")[0]}`);
        return d1 - d2;
      });

      setAppointments(list);
    } catch (e) {
      console.error("Failed to load appointments", e);
    } finally {
      setAppointmentsLoading(false);
    }
  };
  useEffect(() => {
    getInsuranceProviders()
      .then(res => {
        setInsuranceProviders(res.providers || []);
      })
      .catch(err => {
        console.error("Failed to load insurance providers", err);
      });
  }, []);

  useEffect(() => {
    if (activeSection === "appointments") {
      setCurrentPage(1);   // ✅ ADD THIS
      loadAppointments();
    }
  }, [activeSection]);
  const [hospitalProfile, setHospitalProfile] = useState({
    name: "",
    licenseNumber: "",
    gstin: "",
    address: "",
    contactPhone: "",
    email: "",
    website: "",
    latitude: "",
    longitude: "",
    acceptedInsurances: [],   // ✅ ALWAYS OBJECTS
  });


  const [docForm, setDocForm] = useState({
    name: "",
    phone: "",
    email: "",
    specialization: "",
    licenseNumber: "",
    yearsOfExperience: "",
    consultationFee: "",
  });

  const [addMsg, setAddMsg] = useState("");
  const [addError, setAddError] = useState("");

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== "HOSPITAL") {
      alert("Access denied. Hospital only.");
      navigate("/login");
      return;
    }
    setUser(currentUser);
    loadDoctors();
    loadHospitalProfile();
  }, [navigate]);

  const loadHospitalProfile = async () => {
    try {
      const res = await getHospitalProfile();
      console.log("Hospital profile response:", res); // 👈 keep for debug

      if (res && res.profile) {
        setHospitalProfile({
          name: res.profile.name || "",
          licenseNumber: res.profile.licenseNumber || "",
          gstin: res.profile.gstin || "",
          address: res.profile.address || "",
          contactPhone: res.profile.contactPhone || "",
          email: res.profile.email || "",
          website: res.profile.website || "",
          latitude: res.profile.location?.coordinates?.[1] || "",
          longitude: res.profile.location?.coordinates?.[0] || "",
          acceptedInsurances: res.profile.acceptedInsurances || [],
        });

      }
    } catch (e) {
      console.log("Failed to load hospital profile", e);
    }
  };


  const loadDoctors = async () => {
    try {
      setLoading(true);
      const res = await getHospitalDoctors();
      setDoctors(res.doctors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    setAddMsg("");
    setAddError("");

    try {
      setLoading(true);

      const payload = {
        ...docForm,
        yearsOfExperience: Number(docForm.yearsOfExperience),
        consultationFee: Number(docForm.consultationFee),
        availability: "Mon-Fri 9:00 - 5:00",
      };

      await addDoctorByHospital(payload);

      setAddMsg("Doctor added successfully!");
      setDocForm({
        name: "",
        phone: "",
        email: "",
        specialization: "",
        licenseNumber: "",
        yearsOfExperience: "",
        consultationFee: "",
      });

      loadDoctors();
    } catch (err) {
      setAddError(err.message);
    } finally {
      setLoading(false);
    }
  };


  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };
const Sidebar = () => {
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "H";

  return (
    <aside className={`hospital2-sidebar ${isSidebarOpen ? "open" : ""}`}>
      {/* ===== PROFILE HEADER ===== */}
      <div className="hospital2-sidebar-header">
        <div className="hospital2-avatar">{userInitial}</div>
        <div className="hospital2-userinfo">
          <div className="hospital2-username">{hospitalProfile.name || "Hospital"}</div>
        </div>
        <button className="hospital2-close-mobile" onClick={() => setIsSidebarOpen(false)}>✕</button>
      </div>

      {/* ===== NAV ===== */}
      <nav className="hospital2-nav">
        <button
          className={`hospital2-link ${activeSection === "overview" ? "active" : ""}`}
          onClick={() => { setActiveSection("overview"); setIsSidebarOpen(false); }}
        >
          My Doctors
        </button>

        <button
          className={`hospital2-link ${activeSection === "appointments" ? "active" : ""}`}
          onClick={() => { setActiveSection("appointments"); setIsSidebarOpen(false); }}
        >
          Appointments
        </button>

        <button
          className={`hospital2-link ${activeSection === "profile" ? "active" : ""}`}
          onClick={() => { setActiveSection("profile"); setIsSidebarOpen(false); }}
        >
          Hospital Profile
        </button>

        <button
          className={`hospital2-link ${activeSection === "addDoctor" ? "active" : ""}`}
          onClick={() => { setActiveSection("addDoctor"); setIsSidebarOpen(false); }}
        >
          Add Doctor
        </button>

        <button
          className="hospital2-link hospital2-logout"
          onClick={handleLogout}
        >
          Logout
        </button>
      </nav>
    </aside>
  );
};


  const statusColor = (status) => {
    switch (status) {
      case "Pending": return "orange";
      case "Confirmed": return "blue";
      case "Completed": return "green";
      case "Cancelled": return "red";
      default: return "gray";
    }
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        <Sidebar />
        <main className="dashboard-main">
          <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
            ☰ Menu
          </button>
          {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />}
          {activeSection === "appointments" ? (
            <div className="appointments-section">
              <h2>Hospital Appointments</h2>

              {appointmentsLoading && <p>Loading appointments...</p>}

              {!appointmentsLoading && appointments.length === 0 && (
                <p className="muted">No appointments yet.</p>
              )}

              {!appointmentsLoading && paginatedAppointments.map((a) => {
                const isOpen = expandedId === a._id;

                return (
                  <div key={a._id} className="appointment-row">

                    {/* ===== HEADER ROW ===== */}
                    <div
                      className="appointment-summary"
                      onClick={() => setExpandedId(isOpen ? null : a._id)}
                    >
                      <div>
                        <b>{a.patientId?.name}</b> → {a.doctorId?.fullName}
                      </div>

                      <div>{a.date} | {a.timeSlot}</div>

                      <div
                        className="status-pill"
                        style={{ background: statusColor(a.status) }}
                      >
                        {a.status}
                      </div>
                    </div>

                    {/* ===== DROPDOWN DETAILS ===== */}
                    {isOpen && (
                      <div className="appointment-details">

                        <p><b>Doctor:</b> {a.doctorId?.fullName} ({a.doctorId?.specialization})</p>
                        <p><b>Patient:</b> {a.patientId?.name} ({a.patientId?.phone})</p>
                        <p><b>Payment:</b> {a.paymentStatus} ({a.paymentMode})</p>

                        <div className="appointment-actions">
                          {a.status === "Pending" && (
                            <button onClick={() =>
                              updateAppointmentStatus({
                                appointmentId: a._id,
                                status: "Confirmed",
                              }).then(loadAppointments)
                            }>
                              Confirm
                            </button>
                          )}

                          {a.status !== "Cancelled" && a.status !== "Completed" && (
                            <button onClick={() =>
                              updateAppointmentStatus({
                                appointmentId: a._id,
                                status: "Cancelled",
                              }).then(loadAppointments)
                            }>
                              Cancel
                            </button>
                          )}

                          {a.status === "Confirmed" && (
                            <button onClick={() =>
                              updateAppointmentStatus({
                                appointmentId: a._id,
                                status: "Completed",
                                paymentStatus: "Paid",
                              }).then(loadAppointments)
                            }>
                              Mark Completed
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* ===== PAGINATION ===== */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                  >
                    ◀ Prev
                  </button>

                  <span>Page {currentPage} of {totalPages}</span>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    Next ▶
                  </button>
                </div>
              )}

            </div>
          ) : activeSection === "profile" ? (

            <div className="centered-page">
              <div className="form-shell">
                <h2>Hospital Profile</h2>

                <form
                  className="form-card"
                  style={{ maxWidth: 700 }}
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      setLoading(true);
                      await createOrUpdateHospitalProfile({
                        ...hospitalProfile,
                        acceptedInsurances: hospitalProfile.acceptedInsurances.map(i => i._id),
                      });
                      alert("Hospital profile saved!");
                    } catch (err) {
                      alert(err.message);
                    } finally {
                      setLoading(false);
                    }
                  }}
                >

                  <div className="form-group">
                    <label>Hospital Name</label>
                    <input value={hospitalProfile.name}
                      onChange={e => setHospitalProfile({ ...hospitalProfile, name: e.target.value })}
                      required />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>License Number</label>
                      <input value={hospitalProfile.licenseNumber}
                        onChange={e => setHospitalProfile({ ...hospitalProfile, licenseNumber: e.target.value })}
                        required />
                    </div>

                    <div className="form-group">
                      <label>GSTIN</label>
                      <input value={hospitalProfile.gstin}
                        onChange={e => setHospitalProfile({ ...hospitalProfile, gstin: e.target.value })}
                        required />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Address</label>
                    <input value={hospitalProfile.address}
                      onChange={e => setHospitalProfile({ ...hospitalProfile, address: e.target.value })}
                      required />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Phone</label>
                      <input value={hospitalProfile.contactPhone}
                        onChange={e => setHospitalProfile({ ...hospitalProfile, contactPhone: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input value={hospitalProfile.email}
                        onChange={e => setHospitalProfile({ ...hospitalProfile, email: e.target.value })} />
                    </div>
                  </div>

                  {/* 📍 LOCATION */}
                  <button type="button" onClick={() => {
                    navigator.geolocation.getCurrentPosition((pos) => {
                      setHospitalProfile(prev => ({
                        ...prev,
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                      }));
                      alert("Location captured!");
                    }, () => alert("Location permission denied"));
                  }}>
                    📍 Use Current Location
                  </button>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Latitude</label>
                      <input value={hospitalProfile.latitude} readOnly />
                    </div>
                    <div className="form-group">
                      <label>Longitude</label>
                      <input value={hospitalProfile.longitude} readOnly />
                    </div>
                  </div>
                  {/* 🏥 ACCEPTED INSURANCES */}
                  {/* 🏥 ACCEPTED INSURANCES */}
                  <div className="form-group">
                    <label>Accepted Insurances</label>

                    {/* ===== DROPDOWN ===== */}
                    <select
                      value=""
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        if (!selectedId) return;

                        const provider = insuranceProviders.find(p => p._id === selectedId);
                        if (!provider) return;

                        // prevent duplicates
                        if (hospitalProfile.acceptedInsurances.some(i => i._id === selectedId)) return;

                        setHospitalProfile(prev => ({
                          ...prev,
                          acceptedInsurances: [...prev.acceptedInsurances, provider],
                        }));
                      }}
                    >
                      <option value="">➕ Add insurance...</option>
                      {insuranceProviders.map(p => (
                        <option key={p._id} value={p._id}>
                          {p.name}
                        </option>
                      ))}
                    </select>

                    {/* ===== SELECTED LIST ===== */}
                    <div className="selected-insurance-list">
                      {hospitalProfile.acceptedInsurances.length === 0 && (
                        <p className="muted">No insurances added yet</p>
                      )}

                      {hospitalProfile.acceptedInsurances.map((ins) => (
                        <div key={ins._id} className="insurance-chip">
                          <span>{ins.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setHospitalProfile(prev => ({
                                ...prev,
                                acceptedInsurances: prev.acceptedInsurances.filter(i => i._id !== ins._id),
                              }));
                            }}
                          >
                            ❌
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>


                  <button className="btn-primary" disabled={loading}>
                    {loading ? "Saving..." : "Save Profile"}
                  </button>
                </form>
              </div>
            </div>
          ) : activeSection === "addDoctor" ? (

            <div className="centered-page">
              <div className="form-shell">
                <h2>Add New Doctor</h2>
                <form onSubmit={handleAddDoctor} className="form-card" style={{ maxWidth: "600px" }}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Doctor Name</label>
                      <input value={docForm.name} onChange={e => setDocForm({ ...docForm, name: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>Phone (Login ID)</label>
                      <input value={docForm.phone} onChange={e => setDocForm({ ...docForm, phone: e.target.value })} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      value={docForm.email}
                      onChange={e => setDocForm({ ...docForm, email: e.target.value })}
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Specialization</label>
                      <input value={docForm.specialization} onChange={e => setDocForm({ ...docForm, specialization: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>License No.</label>
                      <input value={docForm.licenseNumber} onChange={e => setDocForm({ ...docForm, licenseNumber: e.target.value })} required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Experience (Years)</label>
                      <input
                        type="number"
                        value={docForm.yearsOfExperience}
                        onChange={e => setDocForm({ ...docForm, yearsOfExperience: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Fee ($)</label>
                      <input type="number" value={docForm.consultationFee} onChange={e => setDocForm({ ...docForm, consultationFee: e.target.value })} />
                    </div>
                  </div>

                  <button disabled={loading} className="btn-primary">
                    {loading ? "Adding..." : "Add Doctor"}
                  </button>
                  {addMsg && <p style={{ color: "green", marginTop: "1rem" }}>{addMsg}</p>}
                  {addError && <p style={{ color: "red", marginTop: "1rem" }}>{addError}</p>}
                </form>
              </div>
            </div>
          ) : (
            <>
              <div className="welcome-section">
                <h2>Hospital Management</h2>
                <p>Manage your roster and doctors.</p>
              </div>

              <div className="table-section">
                <h3>Registered Doctors ({doctors.length})</h3>
                {doctors.length === 0 ? <p>No doctors added yet.</p> : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Specialization</th>
                        <th>Phone</th>
                        <th>License</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doctors.map(d => (
                        <tr key={d._id}>
                          <td>{d.fullName}</td>
                          <td>{d.specialization}</td>
                          <td>{d.phone}</td>
                          <td>{d.licenseNumber}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default HospitalDashboard;
