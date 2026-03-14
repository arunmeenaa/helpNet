// src/api.js
const API_URL = import.meta.env.PROD 
  ? "https://helpnet-gw14.onrender.com" 
  : "http://localhost:5000";

export default API_URL;