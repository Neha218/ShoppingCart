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
        var cat = new Category({
          title,
          slug
        });
        cat.save(err => {
          if (err) return console.log(err);
          req.flash("success", "Category added successfully!");
          res.redirect("/admin/categories");
        });
      }
    });
  }
});

/*
 * Get edit category
 */
router.get("/editcategory/:id", (req, res) => {
  Category.findById(req.params.id, (err, cat) => {
    if (err) return console.log(err);
    res.render("admin/editCategory", {
      title: cat.title,
      id: cat._id
    });
  });
});

/*
 * Post edit category
 */
router.post("/editcategory/:id", (req, res) => {
  req.checkBody("title", "Title must have a value.").notEmpty();

  var title = req.body.title;
  var slug = title.replace(/\s+/g, "-").toLowerCase();
  var id = req.params.id;

  var errors = req.validationErrors();

  if (errors) {
    res.render("admin/editCategory", {
      errors,
      title,
      id
    });
  } else {
    Category.findOne({ slug: slug, _id: { $ne: id } }, (err, cat) => {
      if (cat) {
        req.flash("danger", "Category title exist, choose another.");
        res.render("admin/editCategory", {
          title,
          id
        });
      } else {
        Category.findById(id, (err, cat) => {
          if (err) return console.log(err);

          cat.title = title;
          cat.slug = slug;

          cat.save(err => {
            if (err) return console.log(err);
            req.flash("success", "Category edited successfully!");
            res.redirect("/admin/categories/editcategory/" + id);
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
