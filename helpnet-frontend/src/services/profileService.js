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

export const updateCurrentLocation = async (latitude, longitude) => {
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
    console.warn("Geolocation is not supported.");
    return null;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        console.log("========== GPS ==========");
        console.log("Latitude:", coords.latitude);
        console.log("Longitude:", coords.longitude);
        console.log("Accuracy:", coords.accuracy, "meters");
        console.log("=========================");

        // Reject very inaccurate locations
        if (coords.accuracy > 1000) {
          console.warn(`⚠️ GPS accuracy too low: ${coords.accuracy} meters`);

          resolve(null);
          return;
        }

        try {
          const data = await updateCurrentLocation(
            coords.latitude,
            coords.longitude,
            coords.accuracy,
          );

          if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));

            window.dispatchEvent(new Event("local-storage-update"));
          }

          resolve(data.user || data);
        } catch (error) {
          console.warn("Location sync failed:", error.message);

          resolve(null);
        }
      },

      (error) => {
        console.error("GPS ERROR:", error.code, error.message);

        resolve(null);
      },

      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0,
      },
    );
  });
};
