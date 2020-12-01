const express = require("express");
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();


router.get("/", async function (req, res) {
    console.time("get in user controller");
    const options = {
      page: req.query.page,
      limit: req.query.limit,
    };
    try {
      //find all the user with the option of paginate for better querry
      let users = await User.paginate({}, options);
      //on succeed res.status = 200 and return a payload
      res.status(200).send({
        payload: users,
      });
    } catch (err) {
      res.status(406).send({
        error: err,
      });
    }
    console.timeEnd("get in user controller");
  });
  