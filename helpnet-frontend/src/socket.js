// socket.js
import { io } from "socket.io-client";
const isDev = import.meta.env.MODE === 'development';

const API_URL = isDev 
  ? "http://localhost:5000" 
  : import.meta.env.VITE_API_URL;

const socket = io(API_URL, {
  autoConnect: true,
  transports: ['websocket', 'polling']
});

export default socket;