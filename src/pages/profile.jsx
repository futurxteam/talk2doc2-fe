import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getUserProfile } from "./api";
import "./style/profile.css";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        setUser(data?.user || null);
      } catch (error) {
        console.error("Error fetching profile:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <p className="loading">Loading profile...</p>;
  if (!user) return <p className="error">Unable to load profile details.</p>;

  return (
    <div className="profile-layout">
      <Header />

      <div className="profile-body">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="user-initial">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <p className="sidebar-username">{user.name}</p>
          <nav className="sidebar-nav">
            <button className="active">Profile</button>
          </nav>
        </aside>

        {/* Main Profile Content */}
        <main className="profile-content">
          <h2 className="profile-title">Your Profile</h2>

          <div className="profile-card">
            <div className="profile-avatar-large">
              {user.name?.charAt(0).toUpperCase()}
            </div>

            <h3 className="profile-name">{user.name}</h3>

            <div className="profile-info">
              <p><strong>Phone:</strong> {user.phone || "N/A"}</p>
              <p><strong>Gender:</strong> {user.gender || "N/A"}</p>
              <p><strong>Insurance No:</strong> {user.insuranceNo || "N/A"}</p>
              <p><strong>Height:</strong> {user.height ? `${user.height} cm` : "N/A"}</p>
              <p><strong>Weight:</strong> {user.weight ? `${user.weight} kg` : "N/A"}</p>
            </div>

            <button className="edit-btn" onClick={() => alert("Edit profile clicked!")}>
              <i className="fa-solid fa-pen"></i> Edit Profile
            </button>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
