import request from "./apiClient";

export const createRequest = (data) => {
  return request("/api/requests", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const getRequests = () => {
  return request("/api/requests");
};

export const getMyRequests = () => {
  return request("/api/requests/me");
};

export const getRequestById = (id) => {
  return request(`/api/requests/${id}`);
};

export const updateRequest = (id, data) => {
  return request(`/api/requests/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

export const updateRequestStatus = (id, status) => {
  return request(`/api/requests/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
};

export const deleteRequest = (id) => {
  return request(`/api/requests/${id}`, {
    method: "DELETE",
  });
};
