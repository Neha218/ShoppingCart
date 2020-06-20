const mongoose = require("mongoose");

// User schema
const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String
  },
  password: {
    type: String,
    required: true
  },
  admin: {
    type: Number
  }
});

const User = (module.exports = mongoose.model("User", UserSchema));
