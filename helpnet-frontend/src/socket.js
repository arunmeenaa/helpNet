// socket.js
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";

const API_URL = import.meta.env.MODE === 'development' 
  ? "http://localhost:5000" 
  : import.meta.env.VITE_API_URL;

const socket = io(API_URL, {
  autoConnect: true,
  transports: ['websocket'],
  reconnection: true
});

// Helper to join room automatically if token exists
export const joinSocketRoom = () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const decoded = jwtDecode(token);
      if (decoded.id) {
        socket.emit("join_room", decoded.id);
        console.log("Joined socket room:", decoded.id);
      }
    } catch (error) {
      console.error("Socket room join error:", error);
    }
  }
};

export default socket;