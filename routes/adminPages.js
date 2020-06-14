const express = require("express");
const router = express.Router();

// Get page model
const Page = require("../models/page");

// Now this '/' in get method points to the path /admin/pages in the app.js
// If this path in the get is '/test' then it will point to '/admin/pages/test'
/*
 * Get pages index
 */
router.get("/", (req, res) => {
  Page.find({})
    .sort({ sorting: 1 })
    .exec((err, pages) => {
      res.render("admin/pages", {
        pages
      });
    });
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

/*
 * Post add page
 */
router.post("/addpage", (req, res) => {
  req.checkBody("title", "Title must have a value.").notEmpty();
  req.checkBody("content", "Content must have a value.").notEmpty();

  var title = req.body.title;
  var slug = req.body.slug;
  if (slug == "") slug = title.replace(/\s+/g, "-").toLowerCase();
  var content = req.body.content;

  var errors = req.validationErrors();

  if (errors) {
    res.render("admin/addPage", {
      errors,
      title,
      slug,
      content
    });
  } else {
    Page.findOne({ slug: slug }, (err, page) => {
      if (page) {
        req.flash("danger", "Page slug exist, choose another.");
        res.render("admin/addPage", {
          title,
          slug,
          content
        });
      } else {
        var page = new Page({
          title,
          slug,
          content,
          sorting: 100
        });
        page.save(err => {
          if (err) return console.log(err);
          req.flash("Success", "Page added!");
          res.redirect("/admin/pages");
        });
      }
    });
  }
});

/*
 * Post reorder pages
 */
router.post("/reorderpage", (req, res) => {
  var ids = req.body["id[]"];
  var count = 0;
  for (var i = 0; i < ids.length; i++) {
    var id = ids[i];
    count++;
    (count => {
      Page.findById(id, (err, page) => {
        page.sorting = count;
        page.save(err => {
          if (err) return console.log(err);
        });
      });
    })(count);
  }
});

/*
 * Get edit page
 */
router.get("/editpage/:slug", (req, res) => {
  Page.findOne({ slug: req.params.slug }, (err, page) => {
    if (err) return console.log(err);
    res.render("admin/editPage", {
      title: page.title,
      slug: page.slug,
      content: page.content,
      id: page._id
    });
  });
});

// Exports
module.exports = router;
