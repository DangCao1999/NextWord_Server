const admin = require('firebase-admin');
const db = admin.firestore();
const UserDAO = require('./UserDAO');


module.exports.getRoom = async (rid) => {
    let roomRef = db.collection("GameData").doc(rid);

    let rs;
    await roomRef.get().then(data => {
           rs = data.data();
    })
    //console.log(rs);
    await roomRef.collection('Users').get().then(data => {
        rs.users = data.docs.map(value => value.data())
    })
    return rs
}


module.exports.storeRoom = async (data, lengthUser, userLose) => {
    return await db.collection("GameData").add(data).then(docref => {
        let places = 0;
        for (let i = lengthUser -1; i>= 0; i--){
            let user = userLose[i];
            let usertemp = {
                places: places,
                id: user.id,
                word: user.word,
                photo: user.photoURL,
                name: user.name
            }
            db.collection("GameData").doc(docref.id).collection("Users").doc(user.id)
            .set(usertemp);
            UserDAO.saveGameId(user.id, docref.id);
            places++;
        }
        return docref.id;
    })
}

