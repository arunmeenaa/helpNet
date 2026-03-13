// src/api.js

const API_URL = process.env.NODE_ENV === 'production'
  ? "https://your-backend-name.onrender.com" // Replace with your Render URL later
  : "http://localhost:5000";

export default API_URL;