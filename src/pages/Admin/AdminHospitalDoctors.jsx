import React, { useEffect, useState } from "react";
import { getDoctorsByHospitalPaginated, getAdminDoctorById } from "../../api/usersApi";
import { useParams } from "react-router-dom";
import "../style/AdminComponents.css";

export default function AdminHospitalDoctors() {
  const { id: hospitalUserId } = useParams();

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
      const res = await getDoctorsByHospitalPaginated({
        hospitalId: hospitalUserId,
        page,
        limit: 10,
        search,
      });
      setList(res.doctors);
      setTotalPages(res.totalPages);
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (doctorId) => {
    try {
      setDetailLoading(true);
      const res = await getAdminDoctorById(doctorId);
      setDetail(res.doctor);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, search]);

  // reset selection when list changes
  useEffect(() => {
    setSelectedId(null);
    setDetail(null);
  }, [page, search]);

  return (
    <div className="admin-layout">

      {/* ========== LEFT: LIST ========== */}
      <div className="admin-list-panel">
        <h2>Doctors</h2>

        <input
          className="search-input"
          placeholder="Search doctor..."
          value={search}
          onChange={e => { setPage(1); setSearch(e.target.value); }}
        />

        {loading ? <p>Loading...</p> : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Specialization</th>
              </tr>
            </thead>
            <tbody>
              {list.map(d => (
                <tr
                  key={d._id}
                  onClick={() => {
                    setSelectedId(d._id);
                    loadDetail(d._id);
                  }}
                  className={selectedId === d._id ? "selected" : ""}
                >
                  <td>{d.fullName}</td>
                  <td>{d.specialization}</td>
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

        {!selectedId && <p className="muted">Select a doctor to view details</p>}

        {detailLoading && <p>Loading doctor...</p>}

        {detail && !detailLoading && (
          <div className="detail-card">
            <h2>{detail.fullName}</h2>

            <p><b>Phone:</b> {detail.phone || detail.user?.phone}</p>
            <p><b>Email:</b> {detail.email || "-"}</p>
            <p><b>Specialization:</b> {detail.specialization}</p>
            <p><b>Experience:</b> {detail.yearsOfExperience} years</p>
            <p><b>License:</b> {detail.licenseNumber}</p>
            <p><b>Fee:</b> ₹{detail.consultationFee}</p>

            <h3>Working Hours</h3>
            {detail.workingHours ? (
              <p>
                {detail.workingHours.days?.join(", ")} <br />
                {detail.workingHours.start} - {detail.workingHours.end}
              </p>
            ) : (
              <p className="muted">Not set</p>
            )}

            <h3>Other</h3>
            <p><b>Languages:</b> {detail.languages?.join(", ") || "N/A"}</p>
            <p><b>Qualifications:</b> {detail.qualifications?.join(", ") || "N/A"}</p>
            <p><b>Bio:</b> {detail.bio || "N/A"}</p>
          </div>
        )}
      </div>

    </div>
  );
}
