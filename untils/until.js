const config = require('./config');
function randomPin(){
     return Math.floor(Math.random() * 100) + 1;
    // console.log(config);
}
function findRoomByPin(Rooms, roomPin){
    let room = Rooms.find(ele => ele.roomPin == roomPin)
    return room;
}
module.exports = {randomPin, findRoomByPin};