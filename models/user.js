
module.exports = class User {
    constructor(id, name)
    {
        this.id = id;
        this.name = name;
        this.word = [];
    }

    addWordAnswer(word)
    {
        this.word.push(word);
    }
}