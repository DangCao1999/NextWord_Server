const admin = require('firebase-admin');

const db = admin.firestore();



module.exports.addNewUser = async (user) => {
    let uid = user.id;
        const usersRef = db.collection('users').doc(uid);
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
                    game: []
                }
                await usersRef.set(userTemp).then(() => {
                    //console.log("add new user");
                    return true;
                });
                //console.log("check");
            }
        });
}