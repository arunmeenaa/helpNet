import API_URL from "../api";

export const uploadUserProfilePicture = async (file) => {
  const token = localStorage.getItem("token");

  const formData = new FormData();
  formData.append("profilePic", file);

  const response = await fetch(`${API_URL}/api/profile/upload-profile-pic`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Profile upload failed.");
  }

  return data;
};

export const updateCurrentLocation = async (
  latitude,
  longitude,
  accuracy = null,
  source = "gps",
) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/api/profile/location`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      latitude,
      longitude,
      accuracy,
      source,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update location");
  }

  return data;
};

export const syncCurrentLocation = async () => {
  if (!navigator.geolocation) {
    console.warn("📍 Geolocation is not supported.");
    return null;
  }

  return new Promise((resolve) => {
    let bestPosition = null;
    let finished = false;
    let watchId = null;
    let timeoutId = null;

    const finish = async () => {
      if (finished) return;

      finished = true;

      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }

      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }

      if (!bestPosition) {
        console.warn("⚠️ No GPS position received.");
        resolve(null);
        return;
      }

      const { latitude, longitude, accuracy } = bestPosition.coords;

      console.log("========== BEST GPS ==========");
      console.log("Latitude:", latitude);
      console.log("Longitude:", longitude);
      console.log("Accuracy:", accuracy, "meters");
      console.log("==============================");

      // 500m is acceptable for the 2km nearby system
      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        !Number.isFinite(accuracy) ||
        accuracy > 500
      ) {
        console.warn(`⚠️ GPS accuracy too low: ${accuracy} meters`);

        resolve(null);
        return;
      }

      console.log("📍 Saving GPS location to server...");

      try {
        const data = await updateCurrentLocation(
          latitude,
          longitude,
          accuracy,
          "gps",
        );

        console.log("📍 Location API response:", data);

        console.log("📍 Location API response:", data);

        const updatedUser = data?.user || {
          ...JSON.parse(localStorage.getItem("user") || "{}"),
          coordinates: data.coordinates,
          locationUpdatedAt: data.locationUpdatedAt,
          locationSource: "gps",
        };

        if (!updatedUser?.coordinates?.lat || !updatedUser?.coordinates?.lng) {
          console.error(
            "❌ Location API did not return valid coordinates:",
            data,
          );

          resolve(null);
          return;
        }

        localStorage.setItem("user", JSON.stringify(updatedUser));

        window.dispatchEvent(new Event("local-storage-update"));

        console.log("✅ GPS LOCATION SAVED:", updatedUser.coordinates);

        resolve(updatedUser);
      } catch (error) {
        console.error("❌ Failed to save GPS location:", error);

        resolve(null);
      }
    };

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const accuracy = position.coords.accuracy;

        console.log(
          "📍 GPS reading:",
          position.coords.latitude,
          position.coords.longitude,
          "accuracy:",
          accuracy,
        );

        if (!bestPosition || accuracy < bestPosition.coords.accuracy) {
          bestPosition = position;

          console.log("⭐ Better GPS reading:", accuracy, "meters");
        }

        // 500m is good enough for HelpNet's 2km radius
        if (accuracy <= 500) {
          finish();
        }
      },

      (error) => {
        console.warn("📍 GPS error:", error.code, error.message);

        // If we already received a usable GPS reading,
        // DON'T throw it away.
        if (bestPosition) {
          finish();
        } else {
          resolve(null);
        }
      },

      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 30000,
      },
    );

    timeoutId = setTimeout(() => {
      finish();
    }, 30000);
  });
};
