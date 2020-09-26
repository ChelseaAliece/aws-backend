const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const config = require("../config/database");

//Register
router.post("/register", (req, res, next) => {
  let newUser = new User({
    username: req.body.username,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
  });

  User.addUser(newUser, (err, user) => {
    if (err) {
      res.json({ success: false, msg: "Failed to register user" + err });
    } else {
      res.json({ success: true, msg: "User Registered" });
    }
  });
});

//authenticate
router.post("/authenticate", (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  User.getUserByUsername(username, (err, user) => {
    if (err) throw err;
    if (!user) {
      return res.json({ success: false, msg: "User not found" });
    }

    User.comparePassword(password, user.password, (err, isMatch) => {
      if (err) throw err;

      if (isMatch) {
        const token = jwt.sign({data: user}, config.secret, {
          expiresIn: 33600,
        });

        res.json({
          success: true,
          token: "JWT " + token,
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
          },
        });
      } else {
        return res.json({ success: false, msg: "Incorrect Password" });
      }
    });
  });
});

//profile
router.get("/profile", passport.authenticate("jwt", {session: false}), (req, res, next) => {
  res.json({user: req.user});
});

module.exports = router;
