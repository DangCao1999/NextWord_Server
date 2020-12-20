
const roomDAO = require('../DAL/RoomDAO');

module.exports.getRoom = async (req, res) => {
    let rid = req.params.id;
    let rs = await roomDAO.getRoom(rid);
};

module.exports.storeRoom = async (req, res) => {

    
};

