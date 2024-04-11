const express = require("express");
const router = express.Router();
const z = require("zod");
const bcrypt = require("bcrypt");

const newUserModel = require("../models/userModel");

router.get("/getUserByUsername/:username", async (req, res) => {
  const { username } = req.params;
  // Modify the query to find a user by username
  newUserModel.findOne({ username }, function (err, user) {
    if (err) {
      console.log(err);
      return res.status(500).send("Internal server error");
    }
    if (!user) {
      return res.status(404).send("Username does not exist");
    } else {
      return res.json(user);
    }
  });
});

module.exports = router;
