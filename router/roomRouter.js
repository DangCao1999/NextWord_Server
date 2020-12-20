const { Router } = require("express");
const express = require("express");
const RoomBUS = require('../BLL/RoomBUS');
const router = express.Router();


router.get('/:id', RoomBUS.getRoom);
router.post('/', RoomBUS.storeRoom);


module.exports = router;