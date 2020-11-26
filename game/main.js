const config = require('../untils/config');

let checkword = require('./word');
const word = require('./word');
async function main(room, io, socket) {
  console.log("----Main Run----");
  let nextTurnFlag = false;
  let wordStore = [];
  let wordAnswer = '';
  let time = 0;
  let users = room.users;
  let i = 0;
  socket.on("wordAnswer", (word) => {
    wordStore.push(word);
    wordAnswer = word;
  })
  while (checkUserLength(users)) {
    if (wordAnswer != '') {
      console.log("wordAnswer");
      console.log(wordAnswer);
      if (checkWordCorrect(wordAnswer, wordStore)) {      
        users = executeUserLose(users, users[i], io, room.roomPin);
      }
      nextTurnFlag = true;
      i = increaseCounter(users.length, i);
      wordAnswer = '';
    }
    else {
      if(time > 10)
      {
        i = increaseCounter(users.length, i);
        time = 0;
        nextTurnFlag = true;
        users = executeUserLose(users, users[i], io, room.roomPin);
      }
    }
    nextTurnFlag = sendTurn(nextTurnFlag, users[i], io, room.roomPin);
    io.to(room.roomPin.toString()).emit("time", time);
    time++;
    await sleep(1000);
  }

  //winner is extent in array users

  
}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function checkWordCorrect(word, wordStore){
  let firstCharacterOfWord = word[0];
  let lastWordOfWordStore = wordStore[wordStore.length-1]
  let lastCharacterOfWordStore = lastWordOfWordStore[lastWordOfWordStore.length-1];
  if(!checkword(word) || firstCharacterOfWord != lastCharacterOfWordStore){
    return true; // word user send not correct
  }
  return false;
}

function executeUserLose(users, userLose, io, roomPin){
  console.log("user lose");
  users = users.filter( usr => usr.id !== userLose.id ); //find and remove
  io.to(roomPin.toString()).emit("loseUser", userLose);
  return users;
}

function sendTurn(flagNextTurn, user, io, roomPin) {
  if (flagNextTurn) {
    io.to(roomPin.toString()).emit("turnUser", user);
    return false;
  }
}

function increaseCounter(length, i){
  i++;
  if (i >= length - 1) {
    return 0;
  }
  return i;
}

function checkUserLength(users) {
  return users.length > 1;
}

module.exports = main;
