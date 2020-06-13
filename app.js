const express = require("express");
const path = require("path");
const mongoose = require("mongoose");

const config = require("./config/database");

// Connect to db

/***********************************Using MongoClient*********************************************/
// connectionString =
//   "mongodb+srv://Neha:YX1i8IBNpKqVunNS@nodejs-sb0uu.mongodb.net/NodeJS?retryWrites=true&w=majority";
// MongoClient.connect(connectionString, {
//   useUnifiedTopology: true
// })
//   .then(client => {
//     console.log("Connected to Database");
//   })
//   .catch(() => {
//     console.error(err);
//   });
/**************************************************************************************************/

mongoose.connect(config.database);
var db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection Error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Init app
var app = express();

// Views engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Set static folder
app.set(express.static(path.join(__dirname, "public")));

// Set routes
const pages = require("./routes/pages.js");
app.use("/", pages);

const adminPages = require("./routes/adminPages.js");
app.use("/admin/pages", adminPages);

// Start the server
var port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server started on port ${port}`));
