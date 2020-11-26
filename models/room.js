module.exports = class Room {
    constructor(roomPin, ownerId) {
        this.roomPin = roomPin;
        this.ownerId = ownerId;
        this.users = [];
      }
    addUser(user){
      this.users.push(user);
      console.log(this.users);
    }
}