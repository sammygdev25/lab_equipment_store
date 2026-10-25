import { useState, useEffect, useRef } from "react";

export default function useGeolocation(options = {}) {
  const { enableHighAccuracy = true, watchPosition = false, interval = 5000 } = options;
  const [position, setPosition] = useState({ latitude: null, longitude: null, accuracy: null });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const watchRef = useRef(null);

  useEffect(() => {
    if (!navigator.geolocation) { setError("Geolocation not supported"); setLoading(false); return; }
    const onSuccess = (pos) => {
      setPosition({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy });
      setLoading(false); setError(null);
    };
    const onError = (err) => { setError(err.message); setLoading(false); };
    const geoOpts = { enableHighAccuracy, timeout: 10000, maximumAge: 0 };
    if (watchPosition) {
      watchRef.current = navigator.geolocation.watchPosition(onSuccess, onError, geoOpts);
    } else {
      navigator.geolocation.getCurrentPosition(onSuccess, onError, geoOpts);
      if (interval > 0) {
        const timer = setInterval(() => navigator.geolocation.getCurrentPosition(onSuccess, onError, geoOpts), interval);
        return () => clearInterval(timer);
      }
    }
    return () => { if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current); };
  }, [enableHighAccuracy, watchPosition, interval]);

  return { ...position, error, loading };
}
