const admin = require('firebase-admin');

const db = admin.firestore();

const FieldValue = admin.firestore.FieldValue;


module.exports.addNewUser = async (user) => {
    let uid = user.id;
        const usersRef = db.collection('Users').doc(uid);
        return await usersRef.get().then( async userSnapShot => {
            if(userSnapShot.exists){
                //console.log("check exist");
                return false;
            }
            else
            {   
                let userTemp = {
                    name: user.name,
                    photo: user.photo,
                    email: user.email,
                    gameId: []
                }
                return await usersRef.set(userTemp).then(() => {
                    //console.log("add new user");
                    return true;
                });
                //console.log("check");
            }
        });
}

module.exports.saveGameId = (uid,gid) => {
    const usersRef = db.collection('Users');
    return usersRef.doc(uid).update({
        gameId: FieldValue.arrayUnion(gid)
    });
}