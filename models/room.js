module.exports = class Room {
    constructor(roomPin, ownerId) {
        this.roomPin = roomPin;
        this.ownerId = ownerId;
        this.users = [];
        this.usersLose = [];
      }
    addUser(user){
      this.users.push(user);
      console.log(this.users);
    }
}