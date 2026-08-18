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