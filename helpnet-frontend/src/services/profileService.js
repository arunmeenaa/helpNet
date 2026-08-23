import API_URL from "../api";

export const uploadUserProfilePicture = async (file) => {
  const token = localStorage.getItem("token");

  const formData = new FormData();
  formData.append("profilePic", file);

  const response = await fetch(
    `${API_URL}/api/profile/upload-profile-pic`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

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
    body: JSON.stringify({ latitude, longitude }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update location");
  }

  return data;
};

export const syncCurrentLocation = async () => {
  if (!navigator.geolocation) return null;

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const data = await updateCurrentLocation(
            coords.latitude,
            coords.longitude,
          );
          localStorage.setItem("user", JSON.stringify(data.user));
          window.dispatchEvent(new Event("local-storage-update"));
          resolve(data.user);
        } catch (error) {
          console.warn("Location sync skipped:", error.message);
          resolve(null);
        }
      },
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  });
};
