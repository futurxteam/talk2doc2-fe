import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSlots, bookAppointment } from "../api/usersApi";
import {
  LuCalendar,
  LuClock,
  LuCheck,
  LuRefreshCw,
  LuChevronDown,
  LuCreditCard,
  LuShieldCheck,
  LuCalendarCheck
} from "react-icons/lu";
import "./style/BookAppointment.css";

export default function BookAppointmentWidget({ doctorId, assessmentId, onBooked }) {
  const navigate = useNavigate();

  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [paymentMode, setPaymentMode] = useState("Offline");
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  const loadSlots = async (targetDate = date) => {
    if (!targetDate) return;
    setLoadingSlots(true);
    setHasSearched(true);
    try {
      const res = await getSlots(doctorId, targetDate);
      setSlots(res.slots || []);
    } catch (err) {
      console.error("Failed to load slots:", err);
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
    setSelectedSlot("");
    setSlots([]);
    if (newDate) {
      loadSlots(newDate);
    }
  };

  const confirmBooking = async () => {
    if (!selectedSlot) return alert("Please select an available time slot.");

    // Optional: check login
    if (!localStorage.getItem("token")) {
      alert("Please login to book an appointment");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const res = await bookAppointment({
        doctorId,
        date,
        timeSlot: selectedSlot,
        paymentMode,
        assessmentId,
      });

      if (res.success) {
        const a = res.appointment;

        alert(
          `✅ Appointment Booked Successfully!\n\nDate: ${a.date}\nTime: ${a.timeSlot}\n\n📱 Appointment details will be sent to your WhatsApp.\n👤 You can also view it in: Profile → My Appointments.\n\nYou will now be redirected to Home.`
        );

        setSlots([]);
        setSelectedSlot("");

        if (onBooked) onBooked(a);

        // 🔁 Redirect to home
        navigate("/");
      } else {
        alert(res.message || "Booking failed. Please try another slot.");
      }
    } catch (err) {
      alert(err.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="book-appointment-widget">
      <div className="baw-header">
        <div className="baw-header-icon">
          <LuCalendar />
        </div>
        <div className="baw-header-text">
          <h4>Schedule Appointment</h4>
          <p>Choose date and preferred consultation slot</p>
        </div>
      </div>

      {/* Date Picker Row */}
      <div className="baw-field-group">
        <label className="baw-label">
          <LuCalendar className="baw-label-icon" size={14} />
          Select Consultation Date
        </label>
        <div className="baw-date-row">
          <input
            type="date"
            className="baw-date-input"
            min={todayStr}
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
          />
          <button
            type="button"
            className="baw-load-btn"
            onClick={() => loadSlots(date)}
            disabled={!date || loadingSlots}
          >
            <LuRefreshCw className={loadingSlots ? "spinning-compass" : ""} size={14} />
            {loadingSlots ? "Loading..." : "Load Slots"}
          </button>
        </div>
      </div>

      {/* Slots Section */}
      <div className="baw-field-group">
        <label className="baw-label">
          <LuClock className="baw-label-icon" size={14} />
          Available Time Slots
          {slots.length > 0 && <span className="baw-slots-badge">{slots.length} available</span>}
        </label>

        {loadingSlots ? (
          <div className="baw-loading-slots">
            <div className="baw-spinner"></div>
            <span>Fetching available slots...</span>
          </div>
        ) : slots.length === 0 ? (
          <div className="baw-no-slots">
            {hasSearched
              ? "No available slots found for this date. Please select another date."
              : "Pick a date above to view available time slots."}
          </div>
        ) : (
          <div className="baw-slots-grid">
            {slots.map((s) => {
              const isSelected = selectedSlot === s;
              return (
                <button
                  type="button"
                  key={s}
                  onClick={() => setSelectedSlot(s)}
                  className={`baw-slot-btn ${isSelected ? "selected" : ""}`}
                >
                  {isSelected ? <LuCheck size={13} color="#059669" /> : <LuClock size={12} />}
                  <span>{s}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment Preference */}
      <div className="baw-field-group">
        <label className="baw-label">
          <LuCreditCard className="baw-label-icon" size={14} />
          Payment Mode
        </label>
        <div className="baw-select-wrapper">
          <select
            className="baw-select"
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
          >
            <option value="Offline">Pay at Hospital (Cash / Card at desk)</option>
            <option value="Online">Pay Online (Simulated Digital Payment)</option>
          </select>
          <LuChevronDown className="baw-select-arrow" />
        </div>
      </div>

      {/* Confirm Appointment CTA */}
      <button
        type="button"
        disabled={loading || !selectedSlot}
        onClick={confirmBooking}
        className="baw-confirm-btn"
      >
        {loading ? (
          <>
            <div className="baw-spinner" style={{ borderTopColor: "#fff", borderColor: "rgba(255,255,255,0.3)" }}></div>
            <span>Confirming Booking...</span>
          </>
        ) : (
          <>
            <LuCalendarCheck size={18} />
            <span>Confirm Appointment</span>
          </>
        )}
      </button>
    </div>
  );
}
