import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, getAllPatients, getAllDoctors, getUserStats, createHospitalUser } from "../api/usersApi";
import "./style/AdminDashboard.css";



function AdminDashboard() {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState("profile");
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [activeTab, setActiveTab] = useState("stats");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Create Hospital State
    const [hospitalName, setHospitalName] = useState("");
    const [hospitalPhone, setHospitalPhone] = useState("");
    const [createLoading, setCreateLoading] = useState(false);
    const [createMsg, setCreateMsg] = useState("");
    const [createError, setCreateError] = useState("");

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (!currentUser || currentUser.role !== "ADMIN") {
            alert("Access denied. Admin only.");
            navigate("/login");
            return;
        }
        setUser(currentUser);
        loadStats();
    }, [navigate]);

    const handleCreateHospital = async (e) => {
        e.preventDefault();
        setCreateMsg("");
        setCreateError("");

        if (!hospitalName || !hospitalPhone) {
            setCreateError("Name and phone required");
            return;
        }

        try {
            setCreateLoading(true);
            // Calling API to create Hospital
            await createHospitalUser({ name: hospitalName, phone: hospitalPhone });
            setCreateMsg("Hospital added successfully!");
            setHospitalName("");
            setHospitalPhone("");
            loadStats(); // refresh stats
        } catch (err) {
            setCreateError(err.message);
        } finally {
            setCreateLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };


    const AdminSidebar = ({ activeSection, setActiveSection, isOpen, setIsOpen }) => {
        return (
            <aside className={`admin-dash-sidebar ${isOpen ? "open" : ""}`}>
                <div className="admin-dash-sidebar-header">
                    <h3>Admin Panel</h3>
                    <button className="admin-dash-close-mobile" onClick={() => setIsOpen(false)}>✕</button>
                </div>
                <nav className="admin-dash-nav">
                    <button
                        className={`admin-dash-nav-link ${activeSection === "profile" ? "active" : ""}`}
                        onClick={() => { setActiveSection("profile"); setIsOpen(false); }}
                    >
                        <span className="text">Overview</span>
                    </button>
                    <button
                        className={`admin-dash-nav-link ${activeSection === "createHospital" ? "active" : ""}`}
                        onClick={() => { setActiveSection("createHospital"); setIsOpen(false); }}
                    >
                        <span className="text">Add Hospital</span>
                    </button>
                    <button
                        className="admin-dash-logout"
                        onClick={handleLogout}
                    >
                        <span className="text">Logout</span>
                    </button>
                </nav>
            </aside>
        );
    };

    const loadStats = async () => {
        try {
            setLoading(true);
            const res = await getUserStats();
            setStats(res.stats);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadPatients = async () => {
        try {
            setLoading(true);
            const res = await getAllPatients();
            setPatients(res.patients);
        } catch (err) { alert(err.message); } finally { setLoading(false); }
    };

    const loadDoctors = async () => {
        try {
            setLoading(true);
            const res = await getAllDoctors();
            setDoctors(res.doctors);
        } catch (err) { alert(err.message); } finally { setLoading(false); }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === "patients" && patients.length === 0) loadPatients();
        if (tab === "doctors" && doctors.length === 0) loadDoctors();
    };

    return (
        <div className="admin-dash-wrapper">
            <div className="admin-dash-container">
                <AdminSidebar
                    activeSection={activeSection}
                    setActiveSection={setActiveSection}
                    isOpen={isSidebarOpen}
                    setIsOpen={setIsSidebarOpen}
                />
                <main className="admin-dash-main">
                    <button className="admin-dash-mobile-toggle" onClick={() => setIsSidebarOpen(true)}>
                        ☰ Menu
                    </button>
                    {isSidebarOpen && <div className="admin-dash-overlay" onClick={() => setIsSidebarOpen(false)} />}

                    {/* ADD HOSPITAL SECTION */}
                    {activeSection === "createHospital" ? (
                        <div className="admin-dash-create-section">
                            <h2>Add New Hospital</h2>
                            <p>Create a hospital account. They can then add doctors.</p>
                            <form onSubmit={handleCreateHospital} className="admin-dash-form-card">
                                <div className="admin-dash-form-group">
                                    <label>Hospital Name</label>
                                    <input
                                        placeholder="e.g. City General Hospital"
                                        value={hospitalName}
                                        onChange={(e) => setHospitalName(e.target.value)}
                                    />
                                </div>
                                <div className="admin-dash-form-group">
                                    <label>Phone Number (Login ID)</label>
                                    <input
                                        placeholder="e.g. 9876543210"
                                        value={hospitalPhone}
                                        onChange={(e) => setHospitalPhone(e.target.value)}
                                    />
                                </div>
                                <button disabled={createLoading}>
                                    {createLoading ? "Creating..." : "Create Hospital"}
                                </button>
                                {createMsg && <p style={{ color: "green", marginTop: "10px" }}>{createMsg}</p>}
                                {createError && <p style={{ color: "red", marginTop: "10px" }}>{createError}</p>}
                            </form>
                        </div>
                    ) : (
                        /* OVERVIEW SECTION */
                        <>
                            <div className="admin-dash-welcome-section">
                                <h2>Admin Dashboard</h2>
                            </div>

                            <div className="admin-dash-stats-section">

                                <div className="admin-dash-stat-card">
                                    <h3>Total Users</h3>
                                    <p className="admin-dash-stat-number">{stats?.totalUsers}</p>
                                </div>

                                <div
                                    className="admin-dash-stat-card clickable"
                                    onClick={() => navigate("/admin/patients")}
                                >
                                    <h3>Patients</h3>
                                    <p className="admin-dash-stat-number">
                                        {stats?.totalPatients}
                                        <span style={{ fontSize: 14, color: "#6b7280" }}>
                                            {" "}({stats?.patientProfiles} profiled)
                                        </span>
                                    </p>
                                    <small>Click to view</small>
                                </div>

                                <div
                                    className="admin-dash-stat-card clickable"
                                    onClick={() => navigate("/admin/hospitals")}
                                >
                                    <h3>Hospitals</h3>
                                    <p className="admin-dash-stat-number">
                                        {stats?.totalHospitals}
                                        <span style={{ fontSize: 14, color: "#6b7280" }}>
                                            {" "}({stats?.hospitalProfiles} profiled)
                                        </span>
                                    </p>
                                    <small>Browse hospitals</small>
                                </div>

                                <div
                                    className="admin-dash-stat-card"
                                >
                                    <h3>Doctors</h3>
                                    <p className="admin-dash-stat-number">
                                        {stats?.totalDoctors}
                                        <span style={{ fontSize: 14, color: "#6b7280" }}>
                                            {" "}({stats?.doctorProfiles} profiled)
                                        </span>
                                    </p>
                                </div>

                            </div>


                            {loading && <div className="admin-dash-loading">Loading...</div>}


                            {activeTab === "patients" && (
                                <div className="admin-dash-table-section">
                                    <h3>Total Patients: {patients.length}</h3>
                                    <table className="admin-dash-data-table">
                                        <thead><tr><th>Name</th><th>Phone</th><th>Status</th></tr></thead>
                                        <tbody>
                                            {patients.map(p => (
                                                <tr key={p.user._id}>
                                                    <td>{p.profile?.fullName || p.user.name}</td>
                                                    <td>{p.user.phone}</td>
                                                    <td>{p.profile ? "✅" : "⚠️"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeTab === "doctors" && (
                                <div className="admin-dash-table-section">
                                    <h3>Total Doctors: {doctors.length}</h3>
                                    <table className="admin-dash-data-table">
                                        <thead><tr><th>Name</th><th>Phone</th><th>License</th><th>Status</th></tr></thead>
                                        <tbody>
                                            {doctors.map(d => (
                                                <tr key={d.user._id}>
                                                    <td>{d.profile?.fullName || d.user.name}</td>
                                                    <td>{d.user.phone}</td>
                                                    <td>{d.profile?.licenseNumber || "N/A"}</td>
                                                    <td>{d.profile ? "✅" : "⚠️"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}

export default AdminDashboard;
