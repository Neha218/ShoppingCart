const express = require("express");
const router = express.Router();

// Now this '/' in get method points to the path /admin/pages in the app.js
// If this path in the get is '/test' then it will point to '/admin/pages/test'
/*
 * Get pages index
 */
router.get("/", (req, res) => {
  res.send("Admin area");
});

/*
 * Get add page
 */
router.get("/addpage", (req, res) => {
  var title = "";
  var slug = "";
  var content = "";
  res.render("admin/addPage", {
    title,
    slug,
    content
  });
});

// Exports
module.exports = router;
