let isWord = require('is-word');
let englishWords = isWord('american-english');
module.exports = function checkWord(word){
    return englishWords.check(word);
}