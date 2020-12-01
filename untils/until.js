const config = require('./config');
function randomPin(){
     return Math.floor(Math.random() * 100) + 1;
    // console.log(config);
}
function findRoomByPin(Rooms, roomPin){
    let room = Rooms.find(ele => ele.roomPin == roomPin)
    return room;
}
function makeId() {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < config.NUMBER_ROOM; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }
module.exports = {randomPin, findRoomByPin, makeId};