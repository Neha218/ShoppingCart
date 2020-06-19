const express = require("express");
const router = express.Router();

// Get product model
var Product = require("../models/product");

/*
 *  Get add product to cart
 */
router.get("/add/:product", (req, res) => {
  var slug = req.params.product;
  Product.findOne({ slug: slug }, (err, product) => {
    if (err) console.log(err);
    if (typeof req.session.cart == "undefined") {
      req.session.cart = [];
      req.session.cart.push({
        title: slug,
        qty: 1,
        price: parseFloat(product.price).toFixed(2),
        image: product.image
      });
    } else {
      var cart = req.session.cart;
      var newItem = true;

      for (i = 0; i < cart.length; i++) {
        if (cart[i].title == slug) {
          cart[i].qty++;
          newItem = false;
          break;
        }
      }

      if (newItem) {
        cart.push({
          title: slug,
          qty: 1,
          price: parseFloat(product.price).toFixed(2),
          image: product.image
        });
      }
    }
    req.flash("success", "Product added to the cart!");
    res.redirect("back");
  });
});

// Exports
module.exports = router;
