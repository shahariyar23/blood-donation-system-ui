import { useState } from "react";

export interface LocationDetails {
  city?: string;
  quarter?: string;
  road?:string;
  town?: string;
  village?: string;
  county?: string;
  state_district?: string;
  state?: string;
  postcode?: string;
  country?: string;
  country_code?: string;
}

const reverseGeocode = async (lat: number, lon: number) => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;

    const res = await fetch(url, {
      headers: { "User-Agent": "BloodConnect/1.0" },
    });

    if (!res.ok) throw new Error("Geocode failed");

    const data = await res.json();
    const addr = data.address || {};

    return {
      displayName:
        addr.city || addr.town || addr.village || addr.county || "Unknown location",
      details: addr,
    };
  } catch {
    return {
      displayName: "Unknown location",
      details: {},
    };
  }
};

export const useLocation = () => {
  const [loading, setLoading] = useState(false);
  const [helper, setHelper] = useState("Click 📍 to auto-detect location");

  const getLocation = async () => {
  if (!navigator.geolocation) {
    setHelper("Geolocation not supported");
    return null;
  }

  setLoading(true);
  setHelper("Detecting location...");

  return await new Promise((resolve) => {
    let resolved = false;

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        setHelper("Location timeout");
        setLoading(false);
        resolve(null);
      }
    }, 10000); // 10s timeout

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeout);

        try {
          const { latitude, longitude } = pos.coords;

          const { displayName, details } = await reverseGeocode(
            latitude,
            longitude
          );

          setHelper("✓ Location detected");

          resolve({
            latitude,
            longitude,
            displayName,
            details,
          });
        } catch {
          setHelper("Failed to detect location");
          resolve(null);
        } finally {
          setLoading(false);
        }
      },
      () => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeout);

        setHelper("Permission denied");
        setLoading(false);
        resolve(null);
      }
    );
  });
};

  return { getLocation, loading, helper };
};