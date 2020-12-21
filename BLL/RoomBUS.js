
const roomDAO = require('../DAL/RoomDAO');

module.exports.getRoom = async (req, res) => {
    let rid = req.params.id;
    let rs = await roomDAO.getRoom(rid);
    res.status(200).send(rs);
};

module.exports.storeRoom = async (req, res) => {

    
};

