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

          mkdirp.sync("./public/productImages/" + product._id + "/gallery");

          mkdirp.sync(
            "./public/productImages/" + product._id + "/gallery/thumbs"
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
 * Get edit product
 */
router.get("/editproduct/:id", (req, res) => {
  var errors;
  if (req.session.errors) errors = req.session.errors;
  req.session.errors = null;

  Category.find((err, categories) => {
    Product.findById(req.params.id, (err, prod) => {
      if (err) {
        console.log(err);
        res.redirect("/admin/products");
      } else {
        var galleryDir = `public/productImages/${prod._id}/gallery`;
        var galleryImages = null;

        fs.readdir(galleryDir, (err, files) => {
          if (err) console.log(err);
          else {
            galleryImages = files;

            res.render("admin/editProduct", {
              title: prod.title,
              errors,
              desc: prod.desc,
              categories,
              category: prod.category.replace(/\s+/g, "-").toLowerCase(),
              price: parseFloat(prod.price).toFixed(2),
              image: prod.image,
              galleryImages,
              id: prod._id
            });
          }
        });
      }
    });
  });
});

/*
 * Post edit product
 */
router.post("/editproduct/:id", (req, res) => {
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
  var pimage = req.body.pimage;
  var id = req.params.id;

  var errors = req.validationErrors();
  if (errors) {
    req.session.errors = errors;
    req.redirect(`/admin/products/editproduct/${id}`);
  } else {
    Product.findOne({ slug: slug, _id: { $ne: id } }, (err, prod) => {
      if (err) return console.log(err);
      if (prod) {
        req.flash("danger", "Product title exist, choose another.");
        res.redirect(`/admin/products/editproduct/${id}`);
      } else {
        Product.findById(id, (err, prod) => {
          if (err) return console.log(err);
          prod.title = title;
          prod.slug = slug;
          prod.desc = desc;
          prod.price = parseFloat(price).toFixed(2);
          prod.category = category;

          if (imageFile != "") {
            prod.image = imageFile;
          }

          prod.save(err => {
            if (err) return console.log(err);
            if (imageFile != "") {
              if (pimage != "") {
                fs.remove(`public/productImages/${id}/${pimage}`, err => {
                  if (err) console.log(err);
                });
              }
              var prodImg = req.files.image;
              var path = `public/productImages/${id}/${imageFile}`;
              prodImg.mv(path, err => {
                return console.log(err);
              });
            }
            req.flash("success", "Product edited successfully!");
            res.redirect(`/admin/products/editproduct/${id}`);
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
