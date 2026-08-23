const setupSocket = (io) => {
  io.on("connection", (socket) => {
  
    socket.on("join_room", (userId) => {
      if (!userId) return;

      socket.join(userId.toString());
    });

    socket.on("join_apartment", (apartmentId) => {
      if (!apartmentId) return;

      socket.join(apartmentId.toString());
    });

    socket.on("join_admin_room", (apartmentId) => {
      if (!apartmentId) return;

      const roomName = `admin_${apartmentId}`;

      socket.join(roomName);
    });

    socket.on("disconnect", () => {
      console.log("🔌 Socket disconnected:", socket.id);
    });
  });
};

module.exports = setupSocket;
