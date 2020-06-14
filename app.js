const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const expressValidator = require("express-validator");

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

// Set global errors variable
app.locals.errors = null;

// Body Parser Middleware
//
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// Express session middleware
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
  })
);

/***********************************************ISSUE********************************************/
// Express validator middleware
app.use(
  expressValidator({
    errorFormatter: (param, msg, value) => {
      var namespace = param.split("."),
        root = namespace.shift(),
        formParam = root;
      while (namespace.length) {
        formParam += "[" + namespace.shift() + "]";
      }
      return {
        param: formParam,
        msg: msg,
        value: value
      };
    }
  })
);
/***********************************************ISSUE********************************************/

// Express messages middleware
app.use(require("connect-flash")());
app.use((req, res, next) => {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

// Set routes
const pages = require("./routes/pages.js");
app.use("/", pages);

const adminPages = require("./routes/adminPages.js");
app.use("/admin/pages", adminPages);

// Start the server
var port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server started on port ${port}`));
