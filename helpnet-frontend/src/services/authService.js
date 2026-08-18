import request from "./apiClient";


export const registerUser = (data) => {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
};


export const loginUser = (email, password) => {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
};


export const getCurrentUser = () => {
  return request("/api/auth/me");
};

export const updateProfile = (data) => {
  return request("/api/profile", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};