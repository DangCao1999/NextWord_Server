const admin = require('firebase-admin');

const db = admin.firestore();

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

module.exports.storeRoom = async () => {
    
}

