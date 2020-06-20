const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcryptjs");

// Get user model
const User = require("../models/user");

/*
 *  Get register
 */
router.get("/register", (req, res) => {
  res.render("register", {
    title: "Register"
  });
});

/*
 * Post register
 */
router.post("/register", (req, res) => {
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;

  req.checkBody("name", "Name is required!").notEmpty();
  req.checkBody("email", "Please enter valid email id!").isEmail();
  req.checkBody("username", "Username is required!").notEmpty();
  req.checkBody("password", "Password is required!").notEmpty();
  req.checkBody("password2", "Password do not match!").equals(password);

  var errors = req.validationErrors();

  if (errors) {
    res.render("register", {
      errors,
      title: "Register"
    });
  } else {
    User.findOne({ username: username }, (err, user) => {
      if (err) console.log(err);
      if (user) {
        req.flash("danger", "Username exists, choose another!");
        res.redirect("/users/register");
      } else {
        var user = new User({
          name,
          email,
          username,
          password,
          admin: 0
        });
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) console.log(err);
            user.password = hash;
            user.save(err => {
              if (err) console.log(err);
              else {
                req.flash("success", "You are now registered!");
                res.redirect("/users/login");
              }
            });
          });
        });
      }
    });
  }
});

// Exports
module.exports = router;
