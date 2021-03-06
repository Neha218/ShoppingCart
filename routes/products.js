const express = require("express");
const router = express.Router();
const fs = require("fs-extra");
// const isUser = require("../config/auth").isUser;

// Get product model
var Product = require("../models/product");

/*
 *  Get all products
 */
router.get("/", (req, res) => {
  // router.get("/", isUser, (req, res) => {
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

/*
 *  Get products details
 */
router.get("/:category/:product", (req, res) => {
  var galleryImages = null;
  var loggedIn = req.isAuthenticated() ? true : false;
  Product.findOne({ slug: req.params.product }, (err, product) => {
    if (err) console.log(err);
    else {
      var galleryDir = `public/productImages/${product._id}/gallery`;
      fs.readdir(galleryDir, (err, files) => {
        if (err) console.log(err);
        else {
          galleryImages = files;
          res.render("product", {
            title: product.title,
            product,
            galleryImages,
            loggedIn
          });
        }
      });
    }
  });
});

// Exports
module.exports = router;
