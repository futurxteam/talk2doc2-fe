import React, { useEffect, useState } from "react";
import { getMyAppointments } from "../api/usersApi";

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    getMyAppointments().then((res) => {
      setAppointments(res.appointments || []);
    });
  }, []);

  return (
    <div className="page">
      <h2>My Appointments</h2>

      {appointments.length === 0 && <p>No appointments yet.</p>}

      {appointments.map((a) => (
        <div
          key={a._id}
          style={{
            border: "1px solid #ddd",
            padding: 10,
            marginBottom: 10,
          }}
        >
          <p>
            <b>Doctor:</b> {a.doctorId?.fullName}
          </p>
          <p>
            <b>Specialization:</b> {a.doctorId?.specialization}
          </p>
          <p>
            <b>Date:</b> {a.date}
          </p>
          <p>
            <b>Time:</b> {a.timeSlot}
          </p>
          <p>
            <b>Status:</b> {a.status}
          </p>
          <p>
            <b>Payment:</b> {a.paymentStatus} ({a.paymentMode})
          </p>
        </div>
      ))}
    </div>
  );
}
