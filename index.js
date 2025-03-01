/*-----Import Lib------*/
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

/*-----Firebase Config-----*/
const admin = require("firebase-admin");
let serviceAccount = require("./key.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://nextword3659.firebaseio.com"
});


/*-----BL-----*/
const { randomPin, findRoomByPin, makeId } = require('./untils/until');
const app = express();
const cors = require('cors');
const server = http.createServer(app);

const io = socketio(server);

const Room = require('./models/room');

const User = require('./models/user');

const bodyParser = require('body-parser');
const Main = require('./BLL/game/main');





//add middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

/// Add router here

app.use('/user',require('./router/userRouter'));
app.use('/room',require('./router/roomRouter'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/newroom', (req, res)=>{
  console.log("----new room---- "+req.body.id);
  let roomPin = makeId();
  //let roomPin = randomPin().toString();
  let room = new Room(roomPin, req.body.id);
  Rooms.push(room);
  //console.log('create room' + roomPin);
  console.log(room);
  res.status(200).send({roomPin: roomPin, ownerId: req.body.id});
});
app.get('/newroom/:id', (req, res)=> {
  
  let rid = req.params.id;
  // console.log(rid);
  let room = Rooms.find(ele => ele.roomPin == rid);
  //console.log(room);
  if(room)
  {
    return res.status(200).send({roomPin: room.roomPin, ownerId: room.ownerId});
  }
    return res.status(404).send("not found");
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
    main.answerWord(data.word.toLowerCase());
  })
});

server.listen(process.env.PORT || 3000, () => {
  console.log('listening on *:3000');
});