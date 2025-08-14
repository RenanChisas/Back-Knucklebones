const Knucklebones = require("./knucklebones.js");

class KnucklebonesRooms {
  constructor() {
    this.rooms = [];
  }

  addRoom(roomId, players) {
    // Create a new Knucklebones instance for the room
    const knucklebones = new Knucklebones(players);
    const roomConfig = {
      roomId,
      knucklebones,
      free: true,
    };
    this.dice = null;
    this.rooms.push(roomConfig);
    return roomConfig;
  }

  getRoom(roomId) {
    return this.rooms.find((room) => room.roomId === roomId) || null;
  }

  setPrivate(roomId) {
    const privateRoom = this.getRoom(roomId);
    privateRoom.free = false;
  }
  printALL() {
    console.log(this.rooms);
  }
  getALL() {
    return this.rooms.filter((room) => room.free);
  }

  removeRoom(roomId) {
    const index = this.rooms.findIndex((room) => room.roomId === roomId);

    if (index !== -1) {
      const room = this.rooms[index];
      if (typeof room.knucklebones.destroy === "function") {
        room.knucklebones.destroy();
      }

      this.rooms.splice(index, 1);
    }
  }
}

module.exports = new KnucklebonesRooms();
