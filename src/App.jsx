// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import { LanguageProvider } from "./context/LanguageContext"; // ✅ Import provider
import AboutUs from "./pages/about";
import Signup from "./pages/signup";
import Login from "./pages/login";
import Profile from "./pages/profile";
import Interview from "./pages/interviewCore";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import HospitalDashboard from "./pages/HospitalDashboard";
import AdminPatients from "./pages/Admin/AdminPatients";
import AdminHospitals from "./pages/Admin/AdminHospitals";
import AdminHospitalDoctors from "./pages/Admin/AdminHospitalDoctors";
import NearbyClinicsMap from "./pages/nearby";
import MyAppointments from "./pages/MyAppointments";
import VoiceSplitDemoPage from "./pages/VoiceSplitDemoPage";
import VoiceDialerPage from "./pages/VoiceDialerPage";
import VoiceLiveViewPage from "./pages/VoiceLiveViewPage";

function App() {
  return (
    <LanguageProvider>
      <Router>
        {/* Default route lands directly on the 24/7 AI Voice Split Demo */}
        <Routes>
          <Route path="/" element={<VoiceSplitDemoPage />} />
          <Route path="/voice" element={<VoiceSplitDemoPage />} />
          <Route path="/voice/call" element={<VoiceDialerPage />} />
          <Route path="/voice/live" element={<VoiceLiveViewPage />} />
          <Route path="/demo" element={<VoiceSplitDemoPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="/map" element={<NearbyClinicsMap />} />
          <Route path="/appointments" element={<MyAppointments />} />
          {/* Dashboard Routes */}
          <Route path="/dashboard/patient" element={<PatientDashboard />} />
          <Route path="/dashboard/doctor" element={<DoctorDashboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/admin/patients" element={<AdminPatients />} />
          <Route path="/admin/hospitals" element={<AdminHospitals />} />
          <Route path="/admin/hospitals/:id/doctors" element={<AdminHospitalDoctors />} />
          <Route path="/dashboard/hospital" element={<HospitalDashboard />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;
