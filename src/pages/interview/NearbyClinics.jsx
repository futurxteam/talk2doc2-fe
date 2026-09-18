import React, { useEffect, useState } from "react";
import "../style/NearbyClinics.css";
import BookAppointmentWidget from "../BookAppointment";
import API_BASE_URL from "../../config";

const API_BASE = API_BASE_URL;

export default function NearbyClinics({ specialty, assessmentId }) {
  const [groups, setGroups] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedDoctor, setExpandedDoctor] = useState(null);
  const [bookingFor, setBookingFor] = useState(null); // 👈 which doctor booking is open

  useEffect(() => {
    loadNearby();
  }, [specialty]);

  const loadNearby = async () => {
    try {
      setLoading(true);
      setError("");

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          const res = await fetch(
            `${API_BASE}/api/user/nearby?lat=${lat}&lng=${lng}&specialty=${encodeURIComponent(
              specialty || ""
            )}`
          );

          const data = await res.json();

          if (!res.ok) throw new Error(data.error || "Failed to load doctors");

          setGroups(data.groups || {});
        },
        () => {
          setError("Please allow location access");
        }
      );
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load nearby doctors");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="muted">Finding nearby doctors...</p>;
  if (error) return <p className="muted" style={{ color: "red" }}>{error}</p>;
  if (!groups) return null;

  const bucketLabels = {
    "0-5": "🟢 Within 5 km",
    "5-10": "🟡 5 – 10 km",
    "10-15": "🟠 10 – 15 km",
    "15-50": "🔴 15 – 50 km",
  };

  return (
    <div className="nearby-container">
      <h3>Nearby Doctors</h3>

      {Object.entries(bucketLabels).map(([key, label]) => {
        const list = groups[key] || [];
        if (list.length === 0) return null;

        return (
          <div key={key} className="distance-group">
            <h4>{label}</h4>

            {list.map((doc) => (
              <div key={doc._id} className="doctor-card">
                <div
                  className="doctor-summary"
                  onClick={() =>
                    setExpandedDoctor(
                      expandedDoctor === doc._id ? null : doc._id
                    )
                  }
                >
                  <div>
                    <strong>{doc.fullName}</strong> — {doc.specialization}
                    <div className="muted">
                      {doc.hospitalName} • {doc.distanceKm} km
                    </div>
                  </div>

                  <div className="expand-btn">
                    {expandedDoctor === doc._id ? "▲" : "▼"}
                  </div>
                </div>

                {expandedDoctor === doc._id && (
                  <div className="doctor-details">
                    <p><strong>Hospital:</strong> {doc.hospitalName}</p>
                    <p><strong>Address:</strong> {doc.address || "N/A"}</p>
                    <p><strong>Experience:</strong> {doc.yearsOfExperience || "N/A"} years</p>
                    <p><strong>Fee:</strong> ₹{doc.consultationFee || "N/A"}</p>

                    <button
                      className="book-btn"
                      onClick={() =>
                        setBookingFor(bookingFor === doc._id ? null : doc._id)
                      }
                    >
                      📅 {bookingFor === doc._id ? "Close Booking" : "Book Appointment"}
                    </button>

                    {/* 🆕 Inline Booking Widget */}
                    {bookingFor === doc._id && (
                      <div style={{ marginTop: 12 }}>
                        <BookAppointmentWidget
                          doctorId={doc._id}
                          assessmentId={assessmentId}
                          onBooked={() => {
                            alert("Appointment booked successfully!");
                            setBookingFor(null);
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
