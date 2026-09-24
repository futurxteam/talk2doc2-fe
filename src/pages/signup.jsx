import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signup, getInsuranceProviders } from "./api";
import "./style/signup.css";

function Signup() {
  const navigate = useNavigate();
  const [showTerms, setShowTerms] = useState(false);
  const [insuranceProviders, setInsuranceProviders] = useState([]);
  useEffect(() => {
    getInsuranceProviders()
      .then((res) => {
        if (res.success) {
          setInsuranceProviders(res.providers);
        }
      })
      .catch((err) => {
        console.error("Failed to load insurance providers", err);
      });
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    gender: "",
    insuranceProvider: "",
    height: "",
    weight: "",
    accepted: false,
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Step 1: Send OTP (mock for demo)
  const handleSendOtp = (e) => {
    e.preventDefault();

    const { name, phone, accepted } = formData;

    if (!name || !phone) {
      alert("Please fill in Name and Phone Number.");
      return;
    }
    if (!accepted) {
      alert("Please accept Terms and Conditions.");
      return;
    }

    // Mock OTP
    alert("OTP sent to " + phone + " (Use 123)");
    setOtpSent(true);
  };

  // Step 2: Verify OTP & Final Signup
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (otp !== "123") {
      alert("Incorrect OTP. Use 123 for demo.");
      return;
    }

    const { name, gender, phone, insuranceProvider, height, weight } = formData;

    if (!name || !phone || !gender) {
      alert("Please fill in Name, Phone, and Gender.");
      return;
    }

    try {
      setLoading(true);

      // Include OTP in the request
      const res = await signup({
        name,
        gender,
        phone,
        insuranceProvider,
        height,
        weight,
        otp, // This was missing!
      });

      alert("Signup successful!");
      navigate("/login"); // Go to login after signup

    } catch (err) {
      console.error("Signup error:", err);
      alert("Error: " + (err.message || "Signup failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <button type="button" className="back-btn" onClick={() => navigate("/login")}>
          ← Login
        </button>

        <div className="signup-header">

          <h2>Create Account</h2>
          <p>Join us to manage your health better</p>
        </div>

        <form className="signup-form" onSubmit={(e) => e.preventDefault()}>
          {/* Name */}
          <label>Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />

          {/* Phone */}
          <label>Phone Number *</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
            required
          />

          {/* Gender */}
          <label>Gender *</label>
          <select name="gender" value={formData.gender} onChange={handleChange} required>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <label>Insurance Provider</label>

          <select
            name="insuranceProvider"
            value={formData.insuranceProvider}
            onChange={handleChange}
          >
            <option value="">Select Insurance Provider</option>
            {insuranceProviders.map((p) => (
              <option key={p._id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>


          {/* Height */}
          <label>Height (cm)</label>
          <input
            type="number"
            name="height"
            value={formData.height}
            onChange={handleChange}
            placeholder="e.g. 170"
          />

          {/* Weight */}
          <label>Weight (kg)</label>
          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            placeholder="e.g. 65"
          />

          {/* Terms */}
          <div className="terms">
            <input
              type="checkbox"
              name="accepted"
              checked={formData.accepted}
              onChange={handleChange}
            />
            <span>
              I accept the{" "}
              <button
                type="button"
                className="terms-link"
                onClick={() => setShowTerms(true)}
              >
                Terms & Conditions
              </button>
            </span>
          </div>


          {/* OTP Flow */}
          {!otpSent ? (
            <button
              type="button"
              onClick={handleSendOtp}
              className={`send-otp-btn ${formData.accepted ? "" : "disabled"}`}
              disabled={!formData.accepted}
            >
              Send OTP
            </button>
          ) : (
            <>
              <label>Enter OTP *</label>
              <input
                type="text"
                name="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP (123)"
                maxLength={6}
              />
              <button
                type="button"
                onClick={handleVerifyOtp}
                className="verify-otp-btn"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Verify OTP & Sign Up"}
              </button>
            </>
          )}

          <p className="login-text">
            Already a user? <a href="/login">Login</a>
          </p>
        </form>
      </div>
      {showTerms && (
        <div className="terms-modal-backdrop" onClick={() => setShowTerms(false)}>
          <div className="terms-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Terms & Conditions</h3>

            <div className="terms-content">
              <p>

                By using MyDoktor247, you agree to our terms of service. This platform
                provides health assistance and is not a replacement for emergency
                medical services.
              </p>

              <p>
                Your data is securely stored and used only to provide personalized
                healthcare services.
              </p>

              <p>
                Always consult a certified doctor for critical conditions.
              </p>
            </div>

            <button
              className="close-terms-btn"
              onClick={() => setShowTerms(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default Signup;