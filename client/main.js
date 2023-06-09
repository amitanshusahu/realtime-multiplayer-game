import { hideOtherExcept, online, wifuTalk, showButtons, showMsg, speakMsg } from "./domFunctions";
import { io } from "socket.io-client";
const socket = io("http://localhost:3000");



/// ------- Connect to socket io --------

socket.on('connect', (socket) => {
  console.log(socket);
})



/// -------- Handel Online ----------

socket.on("online", (onlinePlayers) => {
  online(onlinePlayers)
})



/// ------- Start Game ----------

let playerId;
socket.emit('start-game', cb => {
  playerId = cb.pid;
  console.log(playerId);
})




/// ------ Handel Rooms -------

let inroom;
socket.on("get-room", (room) => {
  inroom = room;
})

socket.on("joined-room", (roomid) => {
  console.log("joined a room as player 2", roomid);
  wifuTalk("Yaa! you connected with a player. \n Now, make a choise")
  document.getElementById("game").style.scale = "1";
  document.getElementById("chat-box-holder").style.scale = "1";
})




/// ------- Handel Game State -----------

socket.on("game-state", (room, pid) => {
  inroom = room;

  // check who won
  if (playerId == pid) wifuTalk("You Win!!, Choose again for another round");
  else wifuTalk("You Loose!!, Choose again for another round");

  // show score
  if (room.p1.id == playerId) {
    document.getElementById("score").innerText = room.p1.score;
  } else {
    document.getElementById("score").innerText = room.p2.score;
  }

  showButtons()
})


/// -------- Handel Selection -----------

socket.on("player-selection", (str) => {
  wifuTalk(str);
})

document.getElementById("rock-btn").onclick = () => {
  choose("rock");
  hideOtherExcept("rock");
}
document.getElementById("paper-btn").onclick = () => {
  choose("paper");
  hideOtherExcept("paper")
}
document.getElementById("sissior-btn").onclick = () => {
  choose("scissors");
  hideOtherExcept("scissors")
}

function choose(str) {
  socket.emit("update-game", str, inroom.roomId, playerId);
  wifuTalk("Let's wait for your opponent to make a choise")
}



/// ---------- Handel Messages -----------

document.getElementById("send").onclick = () => {
  let inputBox = document.getElementById("chat-input");
  let input = inputBox.value;
  if(input){
    showMsg("You", input);
    inputBox.value = null;
    socket.emit("send-message", input, playerId, inroom);
  }
}

socket.on("get-message", (input, player) => {
  showMsg(player, input);
  speakMsg(input);
})




/// --------- Handel Player Disconnect ---------

socket.on("opponent-disconnected", () => {
  wifuTalk("ohh!! opponet left, lets refresh the page and wait for someone to connect");
  document.getElementById("game").style.scale = "0";
  document.getElementById("chat-box-holder").style.scale = "0";
});
