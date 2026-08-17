const setupSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("⚡ Socket connected:", socket.id);

    // ==========================================
    // USER ROOM
    // Used for private notifications/messages
    // ==========================================
    socket.on("join_room", (userId) => {
      if (!userId) return;

      socket.join(userId.toString());

      console.log(
        `👤 Joined user room: ${userId}`
      );
    });

    // ==========================================
    // APARTMENT ROOM
    // Used for apartment-wide updates
    // ==========================================
    socket.on(
      "join_apartment",
      (apartmentId) => {
        if (!apartmentId) return;

        socket.join(
          apartmentId.toString()
        );

        console.log(
          `🏢 Joined apartment room: ${apartmentId}`
        );
      }
    );

    // ==========================================
    // ADMIN ROOM
    // Used for join-request notifications
    // ==========================================
    socket.on(
      "join_admin_room",
      (apartmentId) => {
        if (!apartmentId) return;

        const roomName =
          `admin_${apartmentId}`;

        socket.join(roomName);

        console.log(
          `👑 Joined admin room: ${roomName}`
        );
      }
    );

    // ==========================================
    // DISCONNECT
    // ==========================================
    socket.on("disconnect", () => {
      console.log(
        "🔌 Socket disconnected:",
        socket.id
      );
    });
  });
};

module.exports = setupSocket;