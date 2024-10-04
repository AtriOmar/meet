require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const attachEvents = require("./attachEvents");

const app = express();

const corsOptions = {
  origins: [process.env.APP_URL, "http://192.168.1.5:5173", "http://192.168.100.24:5173"],
};

app.use(cors(corsOptions));

global.rooms = new Map();

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [process.env.APP_URL, "http://192.168.1.5:5173", "http://192.168.100.24:5173"],
  },
});

app.get("/", (req, res) => {
  res.send("Server is running");
});

attachEvents(io);

server.listen(5000, () => console.log("Server is running on port 5000"));
