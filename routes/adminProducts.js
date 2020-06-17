const express = require("express");
const router = express.Router();
const mkdirp = require("mkdirp");
const fs = require("fs-extra");
const resizeImg = require("resize-img");

// Get product model
const Product = require("../models/product");

// Get category model
const Category = require("../models/category");

// Now this '/' in get method points to the path /admin/pages in the app.js
// If this path in the get is '/test' then it will point to '/admin/pages/test'
/*
 * Get products index
 */
router.get("/", (req, res) => {
  var count;
  Product.countDocuments((err, c) => {
    count = c;
  });

  Product.find((err, products) => {
    res.render("admin/products", {
      products,
      count
    });
  });
});

/*
 * Get add product
 */
router.get("/addproduct", (req, res) => {
  var title = "";
  var desc = "";
  var price = "";
  var image = "";
  Category.find((err, categories) => {
    res.render("admin/addProduct", {
      title,
      desc,
      price,
      image,
      categories
    });
  });
});

/*
 * Post add product
 */
router.post("/addproduct", (req, res) => {
  if (!req.files) {
    imageFile = "";
  }
  if (req.files) {
    var imageFile =
      typeof req.files.image !== "undefined" ? req.files.image.name : "";
  }

  req.checkBody("title", "Title must have a value.").notEmpty();
  req.checkBody("desc", "Description must have a value.").notEmpty();
  req.checkBody("price", "Price must have a value.").isDecimal();
  req.checkBody("image", "You must uplaod an image.").isImage(imageFile);

  var title = req.body.title;
  var slug = title.replace(/\s+/g, "-").toLowerCase();
  var desc = req.body.desc;
  var price = req.body.price;
  var category = req.body.category;

  var errors = req.validationErrors();

  if (errors) {
    Category.find((err, categories) => {
      res.render("admin/addProduct", {
        errors,
        title,
        desc,
        price,
        image: imageFile,
        categories
      });
    });
  } else {
    Product.findOne({ slug: slug }, (err, product) => {
      if (product) {
        req.flash("danger", "Product title exist, choose another.");
        Category.find((err, categories) => {
          res.render("admin/addProduct", {
            title,
            desc,
            price,
            image: imageFile,
            categories
          });
        });
      } else {
        var priceEdited = parseFloat(price).toFixed(2);
        var product = new Product({
          title,
          slug,
          desc,
          price: priceEdited,
          category,
          image: imageFile
        });
        product.save(err => {
          if (err) return console.log(err);

          mkdirp.sync("./public/productImages/" + product._id);

          mkdirp.sync("./public/productImages/" + product._id + "/gallary");

          mkdirp.sync(
            "./public/productImages/" + product._id + "/gallary/thumbs"
          );

          if (imageFile != "") {
            var prodImg = req.files.image;
            // var path = `public/productImages/${product._id}/${imageFile}`;

            prodImg.mv(
              `public/productImages/${product._id}/${imageFile}`,
              err => {
                if (err) {
                  return res.status(500).json({
                    err
                  });
                }
                return res.status(200).json({
                  upload: "Done!"
                });
              }
            );
          }
        });
        req.flash("success", "Product added successfully!");
        res.redirect("/admin/products");
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
router.get("/editpage/:id", (req, res) => {
  Page.findById(req.params.id, (err, page) => {
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
router.post("/editpage/:id", (req, res) => {
  req.checkBody("title", "Title must have a value.").notEmpty();
  req.checkBody("content", "Content must have a value.").notEmpty();

  var title = req.body.title;
  var slug = req.body.slug;
  if (slug == "") slug = title.replace(/\s+/g, "-").toLowerCase();
  var content = req.body.content;
  var id = req.params.id;

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
            res.redirect("/admin/pages/editpage/" + id);
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
