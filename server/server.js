const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, { cors: { origin: "*" } });
const { v4: uuidv4 } = require('uuid');
const cors = require("cors");
app.use(cors());

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

let roomsArr = []
let onlinePlayers = 0;




/// ------ Socket io Handler fun -------

function handelStartGame(io, socket, roomsArr, cb) {

  if (roomsArr.length >= 1) {
    let availableRoom = roomsArr.find(room => room.isAvailable == true);
    if (availableRoom) {
      socket.join(availableRoom.roomId);
      setRoomAvailable(roomsArr, availableRoom.roomId, false, socket);
      io.to(availableRoom.roomId).emit("get-room", availableRoom);
      cb({ pid: socket.id });
      io.to(availableRoom.roomId).emit("joined-room", availableRoom.roomId);
    }
    else createRoom(io, socket, roomsArr, cb);
  }
  else createRoom(io, socket, roomsArr, cb);
}

function createRoom(io, socket, roomsArr, cb) {
  let roomId = uuidv4();
  socket.join(roomId);

  let room = {
    roomId,
    isAvailable: true,
    p1: {
      id: socket.id,
      input: null,
      score: 0
    },
    p2: {
      id: null,
      input: null,
      score: 0
    }
  }

  roomsArr.push(room);
  io.to(room.roomId).emit("get-room", room);
  cb({ pid: socket.id });
}

function setRoomAvailable(roomArr, roomId, boll, socket) {
  for (let i = 0; i < roomArr.length; i++) {
    if (roomArr[i].roomId == roomId) {
      roomArr[i].isAvailable = boll;
      roomArr[i].p2.id = socket.id;
    }
  }
}

function updateGame(roomsArr, input, roomId, playerId) {
  for (let i = 0; i < roomsArr.length; i++) {
    if (roomsArr[i].roomId === roomId) {
      if (roomsArr[i].p1.id === playerId) {
        roomsArr[i].p1.input = input;
        // notify Player 2 about Player 1's selection
        io.to(roomsArr[i].p2.id).emit("player-selection", "Hurry up, P1 made her choise");
      } else if (roomsArr[i].p2.id === playerId) {
        roomsArr[i].p2.input = input;
        // notify Player 1 about Player 2's selection
        io.to(roomsArr[i].p1.id).emit("player-selection", "Hurry up, P2 made her choise");
      }

      // check if both players have made their inputs
      if (roomsArr[i].p1.input && roomsArr[i].p2.input) {
        const p1Input = roomsArr[i].p1.input;
        const p2Input = roomsArr[i].p2.input;
        let winner;
        let pid;

        // Determine the winner based on the inputs
        if (p1Input === p2Input) {
          winner = "draw";
        } else if (
          (p1Input === "rock" && p2Input === "scissors") ||
          (p1Input === "paper" && p2Input === "rock") ||
          (p1Input === "scissors" && p2Input === "paper")
        ) {
          winner = "p1";
          pid = roomsArr[i].p1.id;
        } else {
          winner = "p2";
          pid = roomsArr[i].p2.id;
        }

        // update the scores based on the winner
        if (winner === "p1") {
          roomsArr[i].p1.score += 1;
        } else if (winner === "p2") {
          roomsArr[i].p2.score += 1;
        }

        // reset the inputs for the next round
        roomsArr[i].p1.input = null;
        roomsArr[i].p2.input = null;

        console.log("winner: ", winner);
        // emit the updated game state to all players in the room
        io.to(roomId).emit("game-state", roomsArr[i], pid);
      }

      break;
    }
  }
}

function handelSendMsg(input, playerId, room, socket) {
  let player;
  if (room.p1.id == playerId) player = "P1";
  else player = "P2"
  socket.to(room.roomId).emit("get-message", input, player);
}

function notifyOpponentAboutDisconnection(disconnectedPlayerId) {
  for (let i = 0; i < roomsArr.length; i++) {
    const room = roomsArr[i];
    if (room.p1.id === disconnectedPlayerId) {
      io.to(room.p2.id).emit("opponent-disconnected");
    } else if (room.p2.id === disconnectedPlayerId) {
      io.to(room.p1.id).emit("opponent-disconnected");
    }
  }
}





/// ---- Socket Io Connection ------

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);
  onlinePlayers++;
  io.emit('online', onlinePlayers);

  // start game
  socket.on("start-game", (cb) => {
    handelStartGame(io, socket, roomsArr, cb);
  });

  // update game state
  socket.on("update-game", (input, roomId, playerId) => {
    console.log(input, roomId, playerId);
    updateGame(roomsArr, input, roomId, playerId);
  })

  // send message
  socket.on("send-message", (input, playerId, room) => {
    handelSendMsg(input, playerId, room, socket);
  })

  // disconnect 
  socket.on('disconnect', () => {
    onlinePlayers--;
    io.emit('online', onlinePlayers);
    // notify the other player about the disconnection
    notifyOpponentAboutDisconnection(socket.id);
  });

});




/// -------- Server -------------

server.listen(3000, () => {
  console.log('listening on *:3000');
});