import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSlots, bookAppointment } from "../api/usersApi";

export default function BookAppointmentWidget({ doctorId, assessmentId, onBooked }) {
  const navigate = useNavigate();

  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [paymentMode, setPaymentMode] = useState("Offline");
  const [loading, setLoading] = useState(false);

  const loadSlots = async () => {
    if (!date) return;
    const res = await getSlots(doctorId, date);
    setSlots(res.slots || []);
  };

  const confirmBooking = async () => {
    if (!selectedSlot) return alert("Select a slot");

    // Optional: check login
    if (!localStorage.getItem("token")) {
      alert("Please login to book appointment");
      navigate("/login");
      return;
    }

    setLoading(true);
    const res = await bookAppointment({
      doctorId,
      date,
      timeSlot: selectedSlot,
      paymentMode,
      assessmentId,
    });
    setLoading(false);

    if (res.success) {
      const a = res.appointment;

      alert(
        `✅ Appointment Booked Successfully!

Date: ${a.date}
Time: ${a.timeSlot}

📱 Appointment details will be sent to your WhatsApp.
👤 You can also view it in: Profile → My Appointments.

You will now be redirected to Home.`
      );

      setSlots([]);
      setSelectedSlot("");

      if (onBooked) onBooked(a);

      // 🔁 Redirect to home
      navigate("/");
    } else {
      alert(res.message || "Booking failed");
    }
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
      <h4>📅 Book Appointment</h4>

      <label>Select Date</label>
      <input
        type="date"
        value={date}
        onChange={(e) => {
          setDate(e.target.value);
          setSelectedSlot("");
          setSlots([]);
        }}
      />

      <button onClick={loadSlots} style={{ marginLeft: 8 }}>
        Load Slots
      </button>

      <div style={{ marginTop: 10 }}>
        {slots.length === 0 && <p className="muted">No slots loaded</p>}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {slots.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSlot(s)}
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: selectedSlot === s ? "2px solid green" : "1px solid #ccc",
                background: selectedSlot === s ? "#eaffea" : "#fff",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <label>Payment Mode</label>
        <select
          value={paymentMode}
          onChange={(e) => setPaymentMode(e.target.value)}
        >
          <option value="Offline">Pay at Hospital</option>
          <option value="Online">Pay Online (Simulated)</option>
        </select>
      </div>

      <button
        disabled={loading}
        onClick={confirmBooking}
        style={{ marginTop: 10 }}
      >
        {loading ? "Booking..." : "Confirm Appointment"}
      </button>
    </div>
  );
}
