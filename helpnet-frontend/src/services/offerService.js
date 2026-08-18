import request from "./apiClient";

export const createOffer = (data) => {
  return request("/api/offers", {
    method: "POST",
    body: JSON.stringify(data),
  });
};


export const getOffers = () => {
  return request("/api/offers");
};


export const getMyOffers = () => {
  return request("/api/offers/me");
};


export const getOfferById = (id) => {
  return request(`/api/offers/${id}`);
};

export const updateOffer = (id, data) => {
  return request(`/api/offers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};


export const updateOfferStatus = (id, status) => {
  return request(`/api/offers/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
};


export const deleteOffer = (id) => {
  return request(`/api/offers/${id}`, {
    method: "DELETE",
  });
};