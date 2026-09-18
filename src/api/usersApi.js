// src/api/usersApi.js

const BASE_URL = "https://talk2doc-be.onrender.com";
const API_PREFIX = "/api";

const PROFILE_URL = `${BASE_URL}${API_PREFIX}/profile`;
const ADMIN_URL = `${BASE_URL}${API_PREFIX}/admin`;
const HOSPITAL_URL = `${BASE_URL}${API_PREFIX}/hospital`;

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

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// =============================
// PATIENT PROFILE
// =============================



// =============================
// DOCTOR PROFILE
// =============================
// =============================
// DOCTOR PROFILE (SELF)
// =============================
export const getDoctorProfile = async () => {
  const response = await fetch(`${PROFILE_URL}/doctor/me`, {
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

export const createOrUpdateDoctorProfile = async (data) => {
  const response = await fetch(`${PROFILE_URL}/doctor/me`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse(response);
};
// =============================
// PATIENT PROFILE (SELF)
// =============================
export const getPatientProfile = async () => {
  const response = await fetch(`${PROFILE_URL}/patient/me`, {
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

export const createOrUpdatePatientProfile = async (data) => {
  const response = await fetch(`${PROFILE_URL}/patient/me`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse(response);
};

// =============================
// ADMIN APIs
// =============================
export const getAllPatients = async () => {
  const response = await fetch(`${ADMIN_URL}/patients`, {
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

export const getAllDoctors = async () => {
  const response = await fetch(`${ADMIN_URL}/doctors`, {
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

export const getUserStats = async () => {
  const response = await fetch(`${ADMIN_URL}/stats`, {
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

export const createDoctorUser = async ({ name, phone }) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${ADMIN_URL}/create-doctor`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, phone }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to create doctor");
  }

  return data;
};

export const createHospitalUser = async ({ name, phone }) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${ADMIN_URL}/create-hospital`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, phone }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to create hospital");
  }

  return data;
};

// =============================
// HOSPITAL APIs
// =============================


export const getHospitalDoctors = async () => {
  const response = await fetch(`${HOSPITAL_URL}/doctors`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// =============================
// HELPER - Decode JWT
// =============================
export const getCurrentUser = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload; // { id, role, iat, exp }
  } catch (err) {
    console.error("Failed to decode token:", err);
    return null;
  }
};

export const saveAssessmentResult = async (payload) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not logged in");

  const response = await fetch(`${BASE_URL}/api/user/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
};


export const getHospitalProfile = async () => {
  const response = await fetch(`${HOSPITAL_URL}/profile`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};
export const createOrUpdateHospitalProfile = async (data) => {
  const response = await fetch(`${HOSPITAL_URL}/profile`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};
export const addDoctorByHospital = async (doctorData) => {
  const response = await fetch(`${HOSPITAL_URL}/add-doctor`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(doctorData),
  });

  return handleResponse(response);
};

export const getMyAssessments = async () => {
  const res = await fetch("https://talk2doc-be.onrender.com/api/user/assessments/my", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load assessments");

  return data;
};



export async function getSlots(doctorId, date) {
  const res = await fetch(
    `${BASE_URL}/api/appointments/slots?doctorId=${doctorId}&date=${date}`,
    { headers: getAuthHeaders(), }
  );
  return res.json();
}

export async function bookAppointment(data) {
  const res = await fetch(`${BASE_URL}/api/appointments/book`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getMyAppointments() {
  const res = await fetch(`${BASE_URL}/api/appointments/my-appointments`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export const getDoctorAppointments = async ({ type = "upcoming", date = "" } = {}) => {
  const params = new URLSearchParams();
  params.append("type", type);
  if (date) params.append("date", date);

  const res = await fetch(
    `${BASE_URL}/api/appointments/doctor-appointments?${params.toString()}`,
    { headers: getAuthHeaders() }
  );
  return handleResponse(res);
};

export async function getHospitalAppointments() {
  const res = await fetch(`${BASE_URL}/api/appointments/hospital-appointments`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function updateAppointmentStatus(data) {
  const res = await fetch(`${BASE_URL}/api/appointments/update-status`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}


export const addInsuranceProvider = async (payload) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE}/api/admin/insurance-providers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload), // { name: "Star Health Insurance" }
  });

  return handleResponse(response);
};

export const updateInsuranceProvider = async (id, payload) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE}/api/admin/insurance-providers/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload), // { name, active }
    }
  );

  return handleResponse(response);
};

export const deleteInsuranceProvider = async (id) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE}/api/admin/insurance-providers/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return handleResponse(response);
};

export const getAllInsuranceProvidersAdmin = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE}/api/admin/insurance-providers`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
};


// ADMIN PAGINATED APIs

export const getAdminPatientsPaginated = async ({ page = 1, limit = 20, search = "" }) => {
  const res = await fetch(
    `${BASE_URL}/api/admin/patients/paginated?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
    { headers: getAuthHeaders() }
  );
  return handleResponse(res);
};

export const getAdminHospitalsPaginated = async ({ page = 1, limit = 20, search = "" }) => {
  const res = await fetch(
    `${BASE_URL}/api/admin/hospitals/paginated?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
    { headers: getAuthHeaders() }
  );
  return handleResponse(res);
};

export const getDoctorsByHospitalPaginated = async ({ hospitalId, page = 1, limit = 10, search = "" }) => {
  const res = await fetch(
    `${BASE_URL}/api/admin/doctors-by-hospital/paginated?hospitalId=${hospitalId}&page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
    { headers: getAuthHeaders() }
  );
  return handleResponse(res);
};
export const getAdminPatientById = async (id) => {
  const res = await fetch(
    `${BASE_URL}/api/admin/patients/${id}`,
    { headers: getAuthHeaders() }
  );
  return handleResponse(res);
};
export const getAdminHospitalById = async (id) => {
  const res = await fetch(
    `${BASE_URL}/api/admin/hospitals/${id}`,
    { headers: getAuthHeaders() }
  );
  return handleResponse(res);
};
export const getAdminDoctorById = async (id) => {
  const res = await fetch(
    `${BASE_URL}/api/admin/doctors/${id}`,
    { headers: getAuthHeaders() }
  );
  return handleResponse(res);
};
