const admin = require('firebase-admin');
const db = admin.firestore();


function createUserProfile()
{
    
    db.collection("Users").add({hello: 1});
}