import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const NearbyClinicsMap = () => {
  const [position, setPosition] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const params = new URLSearchParams(window.location.search);
  const specialty = params.get("specialty");


  // Get user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
      },
      () => alert("Please allow location access")
    );
  }, []);

  const loadDoctors = async (nameFilter = "") => {
    if (!position) return;

    try {
      setLoading(true);
      const res = await fetch(
        `https://talk2doc-be.onrender.com/api/user/nearby?lat=${position[0]}&lng=${position[1]}&name=${nameFilter}&specialty=${encodeURIComponent(specialty || "")}`
      );

      const data = await res.json();
      setDoctors(data.doctors || []);
    } catch (e) {
      alert("Failed to load nearby doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (position) loadDoctors();
  }, [position]);

  if (!position) return <p>Getting your location...</p>;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: 10, background: "#fff" }}>
        <h2>Find Nearby Clinics</h2>

        <input
          placeholder="Search by doctor name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: 8, width: 250 }}
        />

        <button
          onClick={() => loadDoctors(search)}
          style={{ marginLeft: 10, padding: 8 }}
        >
          🔍 Search
        </button>

        <span style={{ marginLeft: 20 }}>
          {loading ? "Loading..." : `${doctors.length} clinics found`}
        </span>
      </div>

      <MapContainer
        center={position}
        zoom={13}
        style={{ flex: 1, width: "100%" }}
      >
        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User location */}
        <Marker position={position}>
          <Popup>You are here</Popup>
        </Marker>

        {/* Doctor clinics */}
        {doctors.map((doc) => {
          const lat = doc.location?.coordinates?.[1];
          const lng = doc.location?.coordinates?.[0];
          if (!lat || !lng) return null;

          return (
            <Marker key={doc._id} position={[lat, lng]}>
              <Popup>
                <b>{doc.fullName}</b>
                <br />
                {doc.specialization}
                <br />
                {doc.hospital}
                <br />
                Fee: ₹{doc.consultationFee || "N/A"}
                <br />
                📞 {doc.phone || "N/A"}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default NearbyClinicsMap;
