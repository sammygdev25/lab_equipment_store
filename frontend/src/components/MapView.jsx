import { useEffect, useRef } from "react";

export default function MapView({ center = [37.7749, -122.4194], zoom = 13, markers = [], route = [], height = "400px", onMapClick }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const routeRef = useRef(null);

  useEffect(() => {
    if (!document.querySelector("link[href*=leaflet]")) {
      const link = document.createElement("link");
      link.rel = "stylesheet"; link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    const loadL = () => new Promise((res) => {
      if (window.L) { res(window.L); return; }
      const s = document.createElement("script");
      s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      s.onload = () => res(window.L); document.head.appendChild(s);
    });
    loadL().then((L) => {
      if (mapInstanceRef.current) return;
      const map = L.map(mapRef.current).setView(center, zoom);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);
      if (onMapClick) map.on("click", (e) => onMapClick(e.latlng.lat, e.latlng.lng));
      mapInstanceRef.current = map;
    });
    return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; } };
  }, []);

  useEffect(() => {
    const L = window.L; const map = mapInstanceRef.current;
    if (!L || !map) return;
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];
    markers.forEach(({ lat, lng, label, popup }) => {
      const m = L.marker([lat, lng]).addTo(map);
      if (popup) m.bindPopup(popup); else if (label) m.bindPopup(label);
      markersRef.current.push(m);
    });
    if (markers.length > 1) map.fitBounds(L.latLngBounds(markers.map((m) => [m.lat, m.lng])), { padding: [50, 50] });
    else if (markers.length === 1) map.setView([markers[0].lat, markers[0].lng], zoom);
  }, [markers, zoom]);

  useEffect(() => {
    const L = window.L; const map = mapInstanceRef.current;
    if (!L || !map) return;
    if (routeRef.current) { map.removeLayer(routeRef.current); routeRef.current = null; }
    if (route.length > 1) {
      routeRef.current = L.polyline(route, { color: "var(--color-primary, #3b82f6)", weight: 4, opacity: 0.8 }).addTo(map);
      map.fitBounds(routeRef.current.getBounds(), { padding: [50, 50] });
    }
  }, [route]);

  return <div ref={mapRef} style={{ height, width: "100%", borderRadius: "var(--radius-md, 8px)", overflow: "hidden" }} />;
}
