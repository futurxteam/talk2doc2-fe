import React, { useEffect, useState } from "react";
import { getAdminPatientsPaginated, getAdminPatientById } from "../../api/usersApi";
import "../style/AdminComponents.css";

export default function AdminPatients() {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [selectedId, setSelectedId] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getAdminPatientsPaginated({ page, limit: 20, search });
      setList(res.patients);
      setTotalPages(res.totalPages);
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (id) => {
    try {
      setDetailLoading(true);
      const res = await getAdminPatientById(id);
      setSelectedPatient(res.patient);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, search]);

  // Reset selection when page/search changes
  useEffect(() => {
    setSelectedId(null);
    setSelectedPatient(null);
  }, [page, search]);

  return (
    <div className="admin-layout">

      {/* ========== LEFT: LIST ========== */}
      <div className="admin-list-panel">
        <h2>Patients</h2>

        <input
          className="search-input"
          placeholder="Search by name or phone..."
          value={search}
          onChange={e => { setPage(1); setSearch(e.target.value); }}
        />

        {loading ? <p>Loading...</p> : (
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Phone</th></tr>
            </thead>
            <tbody>
              {list.map(p => (
                <tr
                  key={p._id}
                  onClick={() => {
                    setSelectedId(p._id);
                    loadDetail(p._id);
                  }}
                  className={selectedId === p._id ? "selected" : ""}
                >
                  <td>{p.user?.name}</td>
                  <td>{p.user?.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>◀</button>
          <span>{page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>▶</button>
        </div>
      </div>

      {/* ========== RIGHT: DETAIL ========== */}
      <div className="admin-detail-panel">
        {!selectedId && <p className="muted">Select a patient to view details</p>}

        {detailLoading && <p>Loading profile...</p>}

        {selectedPatient && !detailLoading && (
          <div className="detail-card">
            <h2>Patient Profile</h2>

            <p><b>Name:</b> {selectedPatient.user?.name}</p>
            <p><b>Phone:</b> {selectedPatient.user?.phone}</p>
            <p><b>Age:</b> {selectedPatient.age}</p>
            <p><b>Gender:</b> {selectedPatient.gender}</p>
            <p><b>Blood Group:</b> {selectedPatient.bloodGroup}</p>
            <p><b>Address:</b> {selectedPatient.address}</p>

            <h3>Medical</h3>
            <p><b>Allergies:</b> {selectedPatient.allergies?.join(", ") || "None"}</p>
            <p><b>Chronic:</b> {selectedPatient.chronicDiseases?.join(", ") || "None"}</p>
            <p><b>Medications:</b> {selectedPatient.medications?.join(", ") || "None"}</p>
          </div>
        )}
      </div>

    </div>
  );
}
