
module.exports = class User {
    constructor(id, name, email, photoURL)
    {
        this.id = id;
        this.name = name;
        this.email = email;
        this.photoURL = photoURL;
        this.word = [];
    }

    addWordAnswer(word)
    {
        this.word.push(word);
    }
}