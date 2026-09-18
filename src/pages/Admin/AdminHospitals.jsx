import React, { useEffect, useState } from "react";
import {
  getAdminHospitalsPaginated,
  getAdminHospitalById
} from "../../api/usersApi";
import { useNavigate } from "react-router-dom";
import "../style/AdminComponents.css";

export default function AdminHospitals() {
  const navigate = useNavigate();

  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getAdminHospitalsPaginated({ page, limit: 20, search });
      setList(res.hospitals);
      setTotalPages(res.totalPages);
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (id) => {
    try {
      setDetailLoading(true);
      const res = await getAdminHospitalById(id);
      setDetail(res.hospital);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, search]);

  // Reset selection when list changes
  useEffect(() => {
    setSelectedId(null);
    setDetail(null);
  }, [page, search]);

  return (
    <div className="admin-layout">

      {/* ========== LEFT: LIST ========== */}
      <div className="admin-list-panel">
        <h2>Hospitals</h2>

        <input
          className="search-input"
          placeholder="Search hospital..."
          value={search}
          onChange={e => { setPage(1); setSearch(e.target.value); }}
        />

        {loading ? <p>Loading...</p> : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {list.map(h => (
                <tr
                  key={h._id}
                  onClick={() => {
                    setSelectedId(h._id);
                    loadDetail(h._id);
                  }}
                  className={selectedId === h._id ? "selected" : ""}
                >
                  <td>{h.name}</td>
                  <td>{h.contactPhone || "-"}</td>
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

        {!selectedId && <p className="muted">Select a hospital to view details</p>}

        {detailLoading && <p>Loading hospital...</p>}

        {detail && !detailLoading && (
          <div className="detail-card">
            <h2>{detail.name}</h2>

            <p><b>Phone:</b> {detail.contactPhone || "-"}</p>
            <p><b>Email:</b> {detail.email || "-"}</p>
            <p><b>Address:</b> {detail.address}</p>
            <p><b>License:</b> {detail.licenseNumber}</p>
            <p><b>GSTIN:</b> {detail.gstin}</p>

            <p><b>Verified:</b> {detail.isVerified ? "Yes" : "No"}</p>

            <h3>Accepted Insurances</h3>
            {detail.acceptedInsurances?.length ? (
              <ul>
                {detail.acceptedInsurances.map(i => (
                  <li key={i._id}>{i.name}</li>
                ))}
              </ul>
            ) : (
              <p className="muted">No insurances listed</p>
            )}

            <br />

            <button
              className="btn-primary"
              onClick={() => navigate(`/admin/hospitals/${detail.user}/doctors`)}            >
               View Doctors
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
