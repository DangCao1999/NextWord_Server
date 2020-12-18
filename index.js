const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const { randomPin, findRoomByPin, makeId } = require('./untils/until');
const app = express();
const cors = require('cors');
const server = http.createServer(app);

const io = socketio(server);

const Room = require('./models/room');

const User = require('./models/user');

const bodyParser = require('body-parser');
const Main = require('./game/main');

let admin = require("firebase-admin");

let serviceAccount = require("./key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://nextword3659.firebaseio.com"
});

//add middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());


/// Add router here
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});




app.post('/newroom', (req, res)=>{
  //console.log("----new room---- "+req.body);
  // let roomPin = makeId();
  let roomPin = randomPin().toString();
  let room = new Room(roomPin, req.body.socketId);
  Rooms.push(room);
  console.log('create room' + roomPin);
  res.status(200).send({roomPin: roomPin});
});

let Rooms = [];
let RoomsPlaying = [];

io.on('connection', (socket)=> {
  console.log("someone connection");
  socket.on('joinRoom', (roomPin,user) => {
    socket.join(roomPin);
    console.log('check roomPin' + roomPin);
    let userNew = new User(user['id'], user['givenName'], user['email'], user['photo']);
    console.log("user join room with id" + userNew.id);
    let room = findRoomByPin(Rooms, roomPin);
    if (room == undefined) {
      io.to(roomPin).emit('noti', "khong co phong nay");
    }
    else {
      room.addUser(userNew);
      io.to(roomPin).emit("userInLobby", room.users);
      io.to(roomPin).emit("noti", 'co ng join room' + socket.id);
    }
  })
  socket.on("startPress", (roomPin) => {
    console.log("startPress" + roomPin);
    let room = findRoomByPin(Rooms, roomPin);
    console.log(typeof(roomPin));
    main = new Main(room, io);
    RoomsPlaying.push(main);   
    main.start();
  })
  socket.on("wordAnswer", (data)=>{
    let main = RoomsPlaying.find(ele => ele.room.roomPin == data.roomPin);
    main.answerWord(data.word);
  })
});

server.listen(process.env.PORT || 3000, () => {
  console.log('listening on *:3000');
});