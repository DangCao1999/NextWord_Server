const express = require("express");
const UserBUS = require('../BLL/UserBUS');
const router = express.Router();


router.post('/', UserBUS.addNewUser);

module.exports = router;