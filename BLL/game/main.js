var admin = require('firebase-admin');
const { Socket } = require('socket.io');

var db = admin.firestore();

const config = require('../../untils/config');

let checkword = require('./word');

class Main {
  constructor(room, io) {
    this.room = room,
      this.io = io,
      this.wordStore = [],
      this.users = room.users,
      this.usersLose = [],
      this.turnCounter = 0;
    this.timeAndNextTurnFlag = {
      time: 10,
      nextTurnFlag: true,
    }
    this.wordAnswer = '';
  }

  async start() {
    await this.initGame();
    while (this.checkUserLength(this.users)) {
      if (this.wordAnswer != '') {
        console.log("wordAnswer");
        console.log(this.wordAnswer);
        //this.users[this.turnCounter].addWordAnswer(this.wordAnswer);
        if (this.checkWordCorrect(this.wordAnswer, this.wordStore)) {
          this.users = this.executeUserLose(this.users, this.turnCounter, this.io, this.room.roomPin);
        }
        this.timeAndNextTurnFlag.nextTurnFlag = true;
        this.turnCounter = this.increaseCounter(this.users.length, this.turnCounter);
        this.wordAnswer = '';
        this.sendMess('wordStore', this.wordStore, this.io, this.room.roomPin); // send wordstore
      }
      else {
        if (this.timeAndNextTurnFlag.time < 0) {
          this.timeAndNextTurnFlag.nextTurnFlag = true;
          this.users = this.executeUserLose(this.users, this.turnCounter, this.io, this.room.roomPin);
          this.turnCounter = this.increaseCounter(this.users.length, this.turnCounter);
        }
      }

      console.log("turn Counter" + this.turnCounter);
      this.sendTurn(this.timeAndNextTurnFlag, this.users[this.turnCounter], this.io, this.room.roomPin);
      this.io.to(this.room.roomPin.toString()).emit("time", this.timeAndNextTurnFlag.time);
      this.timeAndNextTurnFlag.time--;


      await this.sleep(1000);
    }
    //send event endGame
    
    //push userwin to lose
    this.usersLose.push(this.users[this.turnCounter]);
    //winner is extent in array users
    //console.log("winner" + this.users.length);
    //console.log(this.usersLose);
    let rid = await this.saveDataGame();
    console.log(rid);
    this.sendMess("endGame", {rid:rid,winner: this.users[this.turnCounter]}, this.io, this.room.roomPin);
    
  }


  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  checkWordCorrect(word, wordStore) {

    //console.log(wordStore.length);
    if (wordStore.length <= 1) {
      if (!checkword(word)) {
        return true;
      }
    }
    else {
      let firstCharacterOfWord = word[0].toLowerCase();
      let lastWordOfWordStore = wordStore[wordStore.length - 2]
      let lastCharacterOfWordStore = lastWordOfWordStore[lastWordOfWordStore.length - 1];
      //console.log("thefirst " + firstCharacterOfWord);
      //console.log("lastWordOfWordStore " + lastWordOfWordStore);
      //console.log("lastcharWordOfWordStore " + lastCharacterOfWordStore);
      //console.log("rs " + firstCharacterOfWord != lastCharacterOfWordStore);
      //console.log("check word " + checkword(word));
      if (!checkword(word) || firstCharacterOfWord != lastCharacterOfWordStore) {
        //console.log("oh no");
        return true; // word user send not correct     
      }
    }
    return false;
  }

  // function firstSendMess(users, )
  executeUserLose(users, turnCounter, io, roomPin) {
    console.log("user lose");
    io.to(roomPin.toString()).emit("loseUser", users[turnCounter]);
    this.usersLose.push(users[turnCounter]);
    users.splice(turnCounter, 1); //find and remove
    this.sendMess("usersLiveCount", users.length, io, roomPin);
    this.sendMess("usersLive", users, io, roomPin);
    return users;
  }

  sendTurn(timeAndNextTurnFlag, user, io, roomPin) {
    if (timeAndNextTurnFlag.nextTurnFlag) {
      console.log(user.id);
      let mess = {
        turnCounter: this.turnCounter,
        user: user
      }
      this.sendMess('turnUser', mess, io, roomPin);
      timeAndNextTurnFlag.time = 10;
      timeAndNextTurnFlag.nextTurnFlag = false;
    }
  }

  resetTime() {
    return 0;
  }

  sendMess(channel, mess, io, roomPin) {
    io.to(roomPin.toString()).emit(channel, mess);
  }

  increaseCounter(length, i) {
    i++;
    if (i >= length) {
      return 0;
    }
    return i;
  }

  checkUserLength(users) {
    return users.length > 1;
  }

  answerWord(word) {
    this.wordStore.push(word);
    this.wordAnswer = word;
    this.users[this.turnCounter].addWordAnswer(word);
  }
  async initGame() {
    //this.sendMess("start", this.users.length, this.io, this.room.roomPin);
    // this.sendMess("usersLive", this.users, this.io, this.room.roomPin);
    this.sendMess("start", "start", this.io, this.room.roomPin);
    await this.sleep(5500);
    this.sendMess("usersTotal", this.users.length, this.io, this.room.roomPin);
    let mess = {
      turnCounter: this.turnCounter,
      user: this.users[this.turnCounter]
    }
    this.sendMess('turnUser', mess, this.io, this.room.roomPin);
  }
  async saveDataGame() {
    //console.log(this.usersLose);
    let lengthUser = this.usersLose.length;
    let winner = this.usersLose[lengthUser - 1];
    let data = {
      roomPin: this.room.roomPin,
      wordStore: this.wordStore,
      winner: {
        uid: winner.id,
        word: winner.word
      }
    }
    return await db.collection("GameData").add(data).then(docref => {
      let places = 0;
      for(let i = lengthUser - 1; i >= 0; i--)
      {
        //console.log(i);
        //console.log(this.usersLose[i]);
        let user = this.usersLose[i];
        let usertemp = {
          places: places,
          id: user.id,
          word: user.word,
          photo: user.photoURL,
          name: user.name
        }
        db.collection("GameData").doc(docref.id).collection("Users").doc(user.id).set(usertemp);
        places++;
      }
      return docref.id;
    });
  }
}







// async function main(room, io, socket) {
//   console.log("----Main Run----");
//   // let nextTurnFlag = true;
//   let wordStore = [];
//   let wordAnswer = '';
//   // let time = 0;
//   let users = room.users;
//   let turnCounter = 0;
//   // socket.on("wordAnswer", (word) => {
//   //   wordStore.push(word);
//   //   wordAnswer = word;
//   // });
//   var roomaa = io.sockets.adapter.rooms[room.roomPin];
//   console.log(roomaa);

//   let timeAndNextTurnFlag = {
//     time: 0,
//     nextTurnFlag: true,
//   }

//   while (checkUserLength(users)) {
//     if (wordAnswer != '') {
//       console.log("wordAnswer");
//       console.log(wordAnswer);
//       users[turnCounter].addWordAnswer(wordAnswer);
//       if (checkWordCorrect(wordAnswer, wordStore)) {      
//         users = executeUserLose(users, turnCounter, io, room.roomPin);
//       }
//       timeAndNextTurnFlag.nextTurnFlag = true;
//       turnCounter = increaseCounter(users.length, turnCounter);
//       wordAnswer = '';
//       sendMess('wordStore' ,wordStore, io, room.roomPin); // send wordstore
//     }
//     else {
//       if(timeAndNextTurnFlag.time > 10)
//       {
//         timeAndNextTurnFlag.nextTurnFlag = true;  
//         users = executeUserLose(users, turnCounter, io, room.roomPin);
//         turnCounter = increaseCounter(users.length, turnCounter);
//       }
//     }

//     sendTurn(timeAndNextTurnFlag, users[turnCounter], io, room.roomPin);
//     io.to(room.roomPin.toString()).emit("time", timeAndNextTurnFlag.time);
//     timeAndNextTurnFlag.time++;


//     await sleep(1000);
//   }

//   //winner is extent in array users
//   console.log("winner" + users.length);
// }


// function sleep(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }

// function checkWordCorrect(word, wordStore){
//   let firstCharacterOfWord = word[0];
//   let lastWordOfWordStore = wordStore[wordStore.length-1]
//   let lastCharacterOfWordStore = lastWordOfWordStore[lastWordOfWordStore.length-1];
//   if(wordStore.length == 0)
//   {
//     if(!checkword(word))
//     {
//       return true;
//     }
//   }
//   else
//   {
//     if(!checkword(word) && firstCharacterOfWord != lastCharacterOfWordStore){
//       return true; // word user send not correct
//     }
//   }
//   return false;
// }

// // function firstSendMess(users, )
// function executeUserLose(users, turnCounter, io, roomPin){
//   console.log("user lose");
//   io.to(roomPin.toString()).emit("loseUser", users[turnCounter]);
//   users.splice(turnCounter, 1); //find and remove
//   let mess = {
//     users: users,
//     indexCurrentUser: turnCounter 
//   }
//   sendMess("usersLive", mess, io, roomPin);
//   return users;
// }

// function sendTurn(timeAndNextTurnFlag, user, io, roomPin) {
//   if (timeAndNextTurnFlag.nextTurnFlag) {
//     io.to(roomPin.toString()).emit("turnUser", user);
//     timeAndNextTurnFlag.time = 0;
//     timeAndNextTurnFlag.nextTurnFlag = false;
//   }
// }

// function resetTime()
// {
//   return 0;
// }
// function sendMess(channel, mess, io, roomPin){
//   io.to(roomPin.toString()).emit(channel, mess);
// }

// function increaseCounter(length, i){
//   i++;
//   if (i >= length - 1) {
//     return 0;
//   }
//   return i;
// }

// function checkUserLength(users) {
//   return users.length > 1;
// }

module.exports = Main;
