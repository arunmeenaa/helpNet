const connectedUsers = new Map();

const setupSocket = (io) => {
  io.on("connection", (socket) => {
    socket.on("join_room", (userId) => {
      if (!userId) return;

      const id = userId.toString();

      socket.join(id);

      connectedUsers.set(id, {
        socketId: socket.id,
      });
    });

    socket.on("join_apartment", (apartmentId) => {
      if (!apartmentId) return;

      socket.join(apartmentId.toString());
    });

    socket.on("join_admin_room", (apartmentId) => {
      if (!apartmentId) return;

      socket.join(`admin_${apartmentId}`);
    });

    socket.on("disconnect", () => {
      for (const [userId, data] of connectedUsers.entries()) {
        if (data.socketId === socket.id) {
          connectedUsers.delete(userId);
          break;
        }
      }
    });
  });
};

setupSocket.connectedUsers = connectedUsers;

module.exports = setupSocket;
