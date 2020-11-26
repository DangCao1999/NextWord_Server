const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const { randomPin, findRoomByPin } = require('./untils/until');
const app = express();

const server = http.createServer(app);
const io = socketio(server);

const Room = require('./models/room');

const User = require('./models/user');

const bodyParser = require('body-parser');
const main = require('./game/main');


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});


app.post('/newroom', (req, res)=>{
  console.log("----new room---- "+req.body);
  let roomPin = randomPin();
  let room = new Room(roomPin, req.body.socketId);
  Rooms.push(room);
  res.status(200).send({roomId: roomPin});
});

let Rooms = []
io.on('connection', socket => {
  console.log("someone connection");
  
  // socket.on("newRoom", () => {
  //   let roomPin = randomPin();
  //   console.log(roomPin);
  //   socket.emit("getRoom", roomPin);
  //   let room = new Room(roomPin, socket.id);
  //   Rooms.push(room);
  //   // console.log(Rooms);
  // })

  socket.on('joinRoom', (roomPin) => {
    socket.join(roomPin);
    console.log(roomPin);
    let user = new User(socket.id, 'aaa');
    let room = findRoomByPin(Rooms, roomPin);
    if (room == undefined) {
      io.to(roomPin).emit('noti', "khong co phong nay");
    }
    else {
      room.addUser(user);
      io.to(roomPin).emit("userInLobby", room.users);
      io.to(roomPin).emit("noti", 'co ng join room' + socket.id);
    }
    //console.log(room);

    //checkword();
  })

  socket.on("startPress", (roomPin) => {
    console.log("startPress" + roomPin);
    let room = findRoomByPin(Rooms, roomPin);
    console.log(typeof(roomPin));
    main(room, io, socket);
  })



  // console.log("connection join some room" + socket.rooms.id);
});



server.listen(3000, () => {
  console.log('listening on *:3000');
});