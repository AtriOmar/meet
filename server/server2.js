const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();

const corsOptions = {
  origins: ["http://localhost:5173", "http://192.168.1.5:5173"],
};

app.use(cors(corsOptions));

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:5173", "http://192.168.1.5:5173"],
  },
});

app.get("/", (req, res) => {
  res.send("Server is running");
});

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("join room", (roomID) => {
    socket.join(roomID);
    socket.to(roomID).emit("user joined", socket.id);
  });

  // data: { userToSignal, signal }
  socket.on("send signal", (data) => {
    console.log(data);
    io.to(data.userToSignal).emit("signal", { sender: socket.id, signal: data.signal });
  });

  // data: { userToSignal, signal }
  socket.on("return signal", (data) => {
    io.to(data.userToSignal).emit("signal-" + socket.id, { userToSignal: socket.id, signal: data.signal });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(5000, () => console.log("Server is running on port 5000"));
