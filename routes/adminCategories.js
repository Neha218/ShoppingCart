const express = require("express");
const router = express.Router();

// Get category model
const Category = require("../models/category");

// Now this '/' in get method points to the path /admin/pages in the app.js
// If this path in the get is '/test' then it will point to '/admin/pages/test'
/*
 * Get categories index
 */
router.get("/", (req, res) => {
  Category.find((err, categories) => {
    if (err) return console.log(err);
    res.render("admin/categories", {
      categories
    });
  });
});

/*
 * Get add category
 */
router.get("/addcategory", (req, res) => {
  var title = "";
  res.render("admin/addCategory", {
    title
  });
});

/*
 * Post add category
 */
router.post("/addcategory", (req, res) => {
  req.checkBody("title", "Title must have a value.").notEmpty();

  var title = req.body.title;
  var slug = title.replace(/\s+/g, "-").toLowerCase();

  var errors = req.validationErrors();

  if (errors) {
    res.render("admin/addCategory", {
      errors,
      title
    });
  } else {
    Category.findOne({ slug: slug }, (err, cat) => {
      if (cat) {
        req.flash("danger", "Category title exist, choose another.");
        res.render("admin/addCategory", {
          title
        });
      } else {
        var category = new Category({
          title,
          slug
        });
        category.save(err => {
          if (err) return console.log(err);
          req.flash("success", "Category added successfully!");
          res.redirect("/admin/categories");
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

/*
 * Post edit page
 */
router.post("/editpage/:slug", (req, res) => {
  req.checkBody("title", "Title must have a value.").notEmpty();
  req.checkBody("content", "Content must have a value.").notEmpty();

  var title = req.body.title;
  var slug = req.body.slug;
  if (slug == "") slug = title.replace(/\s+/g, "-").toLowerCase();
  var content = req.body.content;
  var id = req.body.id;

  var errors = req.validationErrors();

  if (errors) {
    res.render("admin/editPage", {
      errors,
      title,
      slug,
      content,
      id
    });
  } else {
    Page.findOne({ slug: slug, _id: { $ne: id } }, (err, page) => {
      if (page) {
        req.flash("danger", "Page slug exist, choose another.");
        res.render("admin/editPage", {
          title,
          slug,
          content,
          id
        });
      } else {
        Page.findById(id, (err, page) => {
          if (err) return console.log(err);
          page.title = title;
          page.slug = slug;
          page.content = content;

          page.save(err => {
            if (err) return console.log(err);
            req.flash("success", "Page edited successfully!");
            res.redirect("/admin/pages/editpage/" + page.slug);
          });
        });
      }
    });
  }
});

/*
 * Get delete page
 */
router.get("/deletepage/:id", (req, res) => {
  Page.findByIdAndRemove(req.params.id, err => {
    if (err) return console.log(err);
    req.flash("success", "Page deleted successfully!");
    res.redirect("/admin/pages/");
  });
});

// Exports
module.exports = router;
