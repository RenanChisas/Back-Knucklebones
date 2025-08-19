const KnucklebonesRooms = require("../game/KnucklebonesRooms");
const playersInRoom = {};
const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
module.exports = function (io) {
  io.on("connection", async (socket) => {
    const allClients = await io.allSockets();
    console.log("qtdClients:", allClients);
    console.log("New client connected:", socket.id);
    KnucklebonesRooms.printALL();
    socket.on("disconnect", async (reason) => {
      const allClients = await io.allSockets();
      console.log("qtdClients:", allClients);

      if (socket.room) {
        if (playersInRoom.hasOwnProperty(socket.room)) {
          delete playersInRoom[socket.room];
          KnucklebonesRooms.removeRoom(socket.room);
          io.emit("receive-listroom", KnucklebonesRooms.getALL());
        }
        io.to(socket.room).emit("receive-disconnect", socket.id);
      }
    });

    socket.on("join-room", async (room, playerInfo) => {
      if (!room || !uuidRegex.test(room)) {
        socket.emit("room-full", "Invalid room ID");
        return;
      }

      const clients = await io.in(room).allSockets();
      const numClients = clients.size;

      if (numClients >= 2) {
        setTimeout(() => {
          socket.emit("room-full", room);
        }, 50);
        return;
      }

      socket.join(room);
      socket.room = room;

      // Initialize player list if it doesn't exist
      if (!playersInRoom[room]) playersInRoom[room] = [];

      // Avoid adding duplicate players
      if (!playersInRoom[room].some((p) => p[0] === playerInfo[0])) {
        playersInRoom[room].push(playerInfo);
      }

      socket.emit("join-success", room);
      if (!KnucklebonesRooms.getRoom(room)) {
        KnucklebonesRooms.addRoom(room, playersInRoom[room]);
      }

      if (numClients <= 2) {
        const roomInstance = await KnucklebonesRooms.getRoom(room);

        if (!roomInstance) {
          return;
        }

        if (roomInstance.knucklebones.players.length > 1) {
          roomInstance.free = false;
        }

        if (roomInstance.knucklebones.players.length <= 2) {
          setTimeout(() => {
            io.to(room).emit("receiveinfo-players", playersInRoom[room]);
          }, 50);
          io.emit("receive-listroom", KnucklebonesRooms.getALL());
          numberDice = Math.floor(Math.random() * 6) + 1;
          roomInstance.knucklebones.setDice(numberDice);
          setTimeout(() => {
            io.to(room).emit("receive-dice", numberDice);
            io.to(room).emit(
              "receiveinfo-table",
              roomInstance.knucklebones.getTable()
            );
          }, 3500);

          numberTurn = Math.floor(Math.random() * 2);
          if (numberTurn == 0) {
            roomInstance.knucklebones.setTurn(false);
          } else {
            roomInstance.knucklebones.setTurn(true);
          }
          setTimeout(() => {
            io.to(room).emit(
              "receive-turn",
              roomInstance.knucklebones.getTurn()
            );
          }, 4000);
        }
      }
    });

    //GET_TABLES 2
    socket.on("gettable-room", async (room) => {
      if (!room) {
        return;
      }
      const roomInstance = await KnucklebonesRooms.getRoom(room);
      if (roomInstance && roomInstance.knucklebones.players.length <= 2) {
        io.to(room).emit(
          "receiveinfo-table",
          roomInstance.knucklebones.getTable()
        );
      } else {
        console.log("Room not found or players > 2");
      }
    });

    //GETTURN 2
    socket.on("getturn-room", async (room) => {
      if (!room) {
        return;
      }
      const roomInstance = await KnucklebonesRooms.getRoom(room);
      if (roomInstance && roomInstance.knucklebones.players.length <= 2) {
        io.to(room).emit("receive-turn", roomInstance.knucklebones.getTurn());
      } else {
        console.log("Room not found or players > 2");
      }
    });

    //1
    socket.on("getdice-room", async (room) => {
      if (!room) return;

      const roomInstance = await KnucklebonesRooms.getRoom(room);
      if (!roomInstance) {
        console.log("Room not found");
        return;
      }

      let numberDice;

      if (roomInstance.knucklebones.getDice()) {
        numberDice = roomInstance.knucklebones.getDice();
        socket.to(room).emit("receive-dice", numberDice);
        roomInstance.knucklebones.setDice(null);
        return;
      }

      // Generate new dice
      numberDice = Math.floor(Math.random() * 6) + 1;
      roomInstance.knucklebones.setDice(numberDice);
      socket.to(room).emit("receive-dice", numberDice);
    });
    //1
    socket.on("getsumtable-room", async (room) => {
      if (!room) return;

      const roomInstance = await KnucklebonesRooms.getRoom(room);
      if (!roomInstance) {
        console.log("Room not found or players > 2");
        return;
      }
      const returnSum = roomInstance.knucklebones.sumForLine();

      socket.to(room).emit("receive-sumtable", returnSum);
    });

    socket.on("request-listroom", () => {
      socket.emit("receive-listroom", KnucklebonesRooms.getALL());
    });

    socket.on("adddice-room", async (room, line, dice, player) => {
      if (!room) return;
      const roomInstance = await KnucklebonesRooms.getRoom(room);
      if (!roomInstance) {
        console.log("Room not found or players > 2");
        return;
      }

      const returnAddDice = roomInstance.knucklebones.addDice(
        line,
        dice,
        player
      );

      io.to(room).emit(
        "receiveinfo-table",
        roomInstance.knucklebones.getTable()
      );

      const returnSum = roomInstance.knucklebones.sumForLine();
      roomInstance.knucklebones.setPoints(returnSum.sumReturn);

      io.to(room).emit("receive-sumtable", returnSum);

      io.to(room).emit("receive-turn", roomInstance.knucklebones.getTurn());
      io.to(room).emit("receive-points", roomInstance.knucklebones.getPoints());

      numberDice = Math.floor(Math.random() * 6) + 1;
      roomInstance.knucklebones.setDice(numberDice);
      io.to(room).emit("receive-dice", numberDice);
      const endGame = roomInstance.knucklebones.endGame();
      if (endGame) {
        const win = roomInstance.knucklebones.getWins();
        io.to(room).emit("end-game", win);
        KnucklebonesRooms.removeRoom(room);
      }
    });
  });
};
