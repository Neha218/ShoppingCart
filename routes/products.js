const express = require("express");
const router = express.Router();

// Get product model
var Product = require("../models/product");

/*
 *  Get all products
 */
router.get("/", (req, res) => {
  Product.find((err, products) => {
    if (err) console.log(err);
    res.render("allProducts", {
      title: "All Products",
      products
    });
  });
});

/*
 *  Get products by category
 */
router.get("/:category", (req, res) => {
  var categorySlug = req.params.category;
  Category.findOne({ slug: categorySlug }, (err, category) => {
    Product.find({ category: categorySlug }, (err, products) => {
      if (err) console.log(err);
      res.render("catProducts", {
        title: category.title,
        products
      });
    });
  });
});

// Exports
module.exports = router;
