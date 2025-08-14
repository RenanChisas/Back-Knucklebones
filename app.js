require("dotenv").config();

const express = require("express");
const cors = require("cors");
const socketio = require("socket.io");
const http = require("http");

const app = express();
const server = http.createServer(app);

const URL = process.env.UR_FRONT;
const allowedOrigins = [URL];

const io = socketio(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const KnucklebonesRooms = require("./game/KnucklebonesRooms");
const socketHandler = require("./src/sockets");
socketHandler(io);

// Middleware CORS
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // permite Postman/curl
      if (!allowedOrigins.includes(origin)) {
        return callback(new Error("CORS not allowed"), false);
      }
      return callback(null, true);
    },
  })
);

app.use(express.json());

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server Listening on PORT: ${PORT}`));

// Rotas
app.get("/statusSocket", (req, res) => {
  io.allSockets().then((sockets) => {
    const isSocketActive = sockets.size > 0;
    res.send({ status: "Running", socketActive: isSocketActive });
  });
});

app.get("/listRoom", (req, res) => {
  const rooms = KnucklebonesRooms.getALL();
  res.send(rooms);
});
