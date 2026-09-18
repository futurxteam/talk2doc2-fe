// src/api.jsx

// ❌ Frontend must NEVER import backend models
import API_BASE_URL from "../config";

// =============================
// BASE URLS
// =============================
const BASE_URL = API_BASE_URL;
const API_PREFIX = "/api";

const AUTH_URL = `${BASE_URL}${API_PREFIX}/auth`;
const USER_URL = `${BASE_URL}${API_PREFIX}/user`;
const ADAPTIVE_URL = `${BASE_URL}${API_PREFIX}/guided`;
const SYMPTOMS_URL = `${BASE_URL}${API_PREFIX}/symptoms`;
const BODY_PARTS_URL = `${BASE_URL}${API_PREFIX}/bodyparts`;
const SYNDROMIC_URL = `${BASE_URL}${API_PREFIX}/syndromic`;

// =============================
// Helper
// =============================
const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || data?.message || "Something went wrong");
  }

  return data;
};

// =============================
// AUTH
// =============================
export const signup = async (payload) => {
  const response = await fetch(`${AUTH_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
};
export const getInsuranceProviders = async () => {
  const response = await fetch(`${BASE_URL}/api/auth/insurance-providers`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  return handleResponse(response);
};
export const doctorSignup = async (payload) => {
  const response = await fetch(`${AUTH_URL}/doctor-signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
};

export const sendLoginOTP = async (phone) => {
  const response = await fetch(`${AUTH_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });

  return handleResponse(response);
};

export const login = async ({ phone, otp }) => {
  const response = await fetch(`${AUTH_URL}/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, otp }),
  });

  const data = await handleResponse(response);
  if (data.token) localStorage.setItem("token", data.token);
  return data;
};

export const getUserProfile = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const response = await fetch(`${USER_URL}/profile`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
};

// =============================
// BODY PARTS
// =============================
export const getPrimaryRegions = async () => {
  const response = await fetch(BODY_PARTS_URL);
  return handleResponse(response);
};

export const getSubParts = async (region) => {
  const encoded = encodeURIComponent(region);
  const response = await fetch(`${BODY_PARTS_URL}/${encoded}/parts`);
  return handleResponse(response);
};

export const getSymptomsForPart = async (region, subpart) => {
  const r = encodeURIComponent(region);
  const p = encodeURIComponent(subpart);

  const response = await fetch(
    `${BODY_PARTS_URL}/${r}/parts/${p}/symptoms`
  );

  return handleResponse(response);
};

// =============================
// SYNDROMIC ENGINE
// =============================
export const startSyndromicInterview = async (payload) => {
  const response = await fetch(`${SYNDROMIC_URL}/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
};

export const answerSyndromicQuestion = async (payload) => {
  const response = await fetch(`${SYNDROMIC_URL}/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
};

// =============================
// SYMPTOM ENGINE
// =============================
export const nextSymptom = async (payload) => {
  const response = await fetch(`${SYMPTOMS_URL}/next`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
};

export const finalDiagnosis = async (payload) => {
  const response = await fetch(`${SYMPTOMS_URL}/final`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
};


export const getNearbyDoctors = async ({ lat, lng, name = "", specialty = "" }) => {
  const params = new URLSearchParams({
    lat,
    lng,
    name,
    specialty,
  });

  const response = await fetch(`${USER_URL}/nearby?${params.toString()}`);
  return handleResponse(response);
};