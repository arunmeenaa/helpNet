const LOCATION_CACHE_KEY = "user-location-name";

export const getCachedLocationName = () => {
  try {
    return localStorage.getItem(LOCATION_CACHE_KEY) || "";
  } catch {
    return "";
  }
};

export const getLocationName = async (latitude, longitude) => {
  if (
    !Number.isFinite(Number(latitude)) ||
    !Number.isFinite(Number(longitude))
  ) {
    return "";
  }

  // Check cached coordinates
  try {
    const cached = JSON.parse(
      localStorage.getItem(LOCATION_CACHE_KEY) || "null"
    );

    if (
      cached &&
      Math.abs(cached.lat - Number(latitude)) < 0.001 &&
      Math.abs(cached.lng - Number(longitude)) < 0.001
    ) {
      return cached.name;
    }
  } catch {
    // Ignore invalid cache
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
        latitude
      )}&lon=${encodeURIComponent(longitude)}&zoom=18&addressdetails=1`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Reverse geocoding failed");
    }

    const data = await response.json();
    const address = data.address || {};

    // Prefer the most specific area/locality available
    const area =
      address.suburb ||
      address.neighbourhood ||
      address.quarter ||
      address.residential ||
      address.village ||
      address.town;

    const city =
      address.city ||
      address.municipality ||
      address.town ||
      address.village;

    const state = address.state;

    let name = "";

    if (area && city && area.toLowerCase() !== city.toLowerCase()) {
      name = `${area}, ${city}`;
    } else if (city && state) {
      name = `${city}, ${state}`;
    } else {
      name = area || city || state || "Current Location";
    }

    // Cache result
    localStorage.setItem(
      LOCATION_CACHE_KEY,
      JSON.stringify({
        lat: Number(latitude),
        lng: Number(longitude),
        name,
      })
    );

    return name;
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return "";
  }
};