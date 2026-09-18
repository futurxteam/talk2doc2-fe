import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { login, sendLoginOTP } from "./api";
import { getCurrentUser } from "../api/usersApi";
import { useTranslation } from "react-i18next";

import "./style/login.css";

function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect");

  // Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phone) return alert(t("login.enterPhone"));

    try {
      setLoading(true);
      await sendLoginOTP(phone);
      alert(t("login.otpSent"));
      setOtpSent(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return alert(t("login.enterOtp"));

    try {
      setLoading(true);
      const res = await login({ phone, otp });

      if (res.token) {
        localStorage.setItem("token", res.token);
        alert(`${t("login.loginSuccess")} ${res.user?.name || "User"}`);

        const user = getCurrentUser();

        if (redirect) {
          navigate(redirect);
          return;
        }

        if (user?.role === "ADMIN") navigate("/dashboard/admin");
        else if (user?.role === "DOCTOR") navigate("/dashboard/doctor");
        else if (user?.role === "HOSPITAL") navigate("/dashboard/hospital");
        else navigate("/dashboard/patient");
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <div className="login-container">
      <div className="login-card">
        <button type="button" className="back-btn" onClick={() => navigate("/")}>
          ← {t("login.home")}
        </button>

        <div className="login-header">
          
         <img src="/Talk2Doc.png" alt="Talk2Doc 24/7" className="login-logo" />

          <p>{t("login.subtitle")}</p>
        </div>

        <form className="login-form">
          {/* PHONE INPUT */}
          <label>{t("login.phoneLabel")} *</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("login.phonePlaceholder")}
          />

          {!otpSent ? (
            <button onClick={handleSendOtp} disabled={loading}>
              {loading ? t("login.sending") : t("login.sendOtp")}
            </button>
          ) : (
            <>
              {/* OTP INPUT */}
              <label>{t("login.otpLabel")} *</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder={t("login.otpPlaceholder")}
              />

              <button onClick={handleVerifyOtp} disabled={loading}>
                {loading ? t("login.verifying") : t("login.verifyOtp")}
              </button>
            </>
          )}

          <div className="signup-text">
            {t("login.noAccount")} <a href="/signup">{t("login.signup")}</a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
