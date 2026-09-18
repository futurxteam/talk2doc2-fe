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
function App() {
  return (
    <LanguageProvider>
      <Router>
        {/* ✅ Available on all pages */}
        <Routes>
          <Route path="/" element={<Home />} />
          {/* You can add more pages here like: */}
          {/* <Route path="/about" element={<About />} /> */}
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
