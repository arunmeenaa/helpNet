import API_URL from "../api";
import request from "./apiClient";

export const createApartment = (data) => {
  return request("/api/admin/create-apartment", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const getMyApartment = () => {
  return request("/api/admin/my-apartment");
};

export const getMembers = () => {
  return request("/api/admin/members");
};

export const getPendingJoinRequests = () => {
  return request("/api/admin/join-requests");
};

export const removeMember = (userId) => {
  return request(`/api/admin/remove-user/${userId}`, {
    method: "DELETE",
  });
};

export const approveJoinRequest = (requestId, userId) => {
  return request("/api/admin/approve-join", {
    method: "POST",
    body: JSON.stringify({
      requestId,
      userId,
    }),
  });
};

export const rejectJoinRequest = (requestId) => {
  return request("/api/admin/reject-join", {
    method: "DELETE",
    body: JSON.stringify({
      requestId,
    }),
  });
};



export const uploadProfilePicture = async (file) => {
  const token = localStorage.getItem("token");

  const formData = new FormData();
  formData.append("profilePic", file);

  const response = await fetch(
    `${API_URL}/api/admin/upload-profile-pic`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  const contentType = response.headers.get("content-type");

  if (!response.ok) {
    if (contentType?.includes("application/json")) {
      const data = await response.json();
      throw new Error(data.message || "Owner profile upload failed.");
    }

    throw new Error(
      `Upload failed: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
};

export const getUserProfile = (id) => {
  return request(`/api/admin/user/${id}`);
};