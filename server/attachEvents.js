module.exports = function attachEvents(io) {
  io.on("connection", async (socket) => {
    console.log("connected");

    let user = JSON.parse(socket.handshake.query.user);
    user.socketId = socket.id;
    let roomId = undefined;

    socket.on("join-room", async (_roomId) => {
      roomId = _roomId;
      console.log("join-room", roomId);

      let room = global.rooms.get(roomId);

      if (!room) {
        global.rooms.set(roomId, { id: roomId, name: "Room" + roomId, host: user, users: [] });

        room = global.rooms.get(roomId);
      }

      console.log(global.rooms, room);

      room.users.push(user);

      socket.join(roomId);
      socket.to(roomId).emit("user-joined", user);
    });

    // data: { userToSignal, signal }
    socket.on("send-signal", ({ userToSignal, signal }) => {
      console.log("-------------------- userToSignal, signal send-signal --------------------");
      io.to(userToSignal.socketId).emit("signal", { sender: user, signal });
    });

    // data: { userToSignal, signal }
    socket.on("return-signal", ({ userToSignal, signal }) => {
      io.to(userToSignal.socketId).emit("signal-" + user.socketId, { userToSignal: user, signal });
    });

    socket.on("request-stream-settings", ({ to }) => {
      io.to(to).emit("request-stream-settings", { from: user.socketId });
    });

    socket.on("stream-settings", ({ to, streamSettings }) => {
      io.to(to).emit("stream-settings", { from: user.socketId, streamSettings });
    });

    socket.on("message", ({ message }) => {
      console.log("message", message);
      io.to(roomId).emit("message", { user, message });
    });

    socket.on("disconnect", async () => {
      io.emit("user-left", user.socketId);
      console.log("user-left");
    });
  });
};
