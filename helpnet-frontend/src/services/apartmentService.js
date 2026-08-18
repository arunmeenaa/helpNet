import request from "./apiClient";

// ==========================================
// SEND JOIN REQUEST
// ==========================================
export const createJoinRequest = (apartmentId) => {
  return request("/api/admin/join-requests", {
    method: "POST",
    body: JSON.stringify({
      apartmentId,
    }),
  });
};