const express = require("express");
const router = express.Router();

// Now this '/' in get method points to the path /admin/pages in the app.js
// If this path in the get is '/test' then it will point to '/admin/pages/test'
router.get("/", (req, res) => {
  res.send("Admin area");
});

// Exports
module.exports = router;
