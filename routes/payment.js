const express = require("express");
const router = express.Router();
const paypal = require("paypal-rest-sdk");

// Paypal configuration
paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "AeuJmGGK0aGKRKeIqR6hXAOJdFOnjVn3ZjD1y0ygNx3MbiwYn0M2la4iaimzo-eyKeHQkA5y6-RS5q9l",
  client_secret:
    "EGk3TGs0KpM9SscoaJxuy8wheFlq-3wU0jy7fWpft4b-GioR1a4iLJ90ufVIUjcQCF_PyohbMTP-0_WD"
});

router.post("/pay", (req, res) => {
  var cart = req.session.cart;
  var items = [];
  console.log("Cart: ", cart);
  var create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal"
    },
    redirect_urls: {
      return_url: "http://return.url",
      cancel_url: "http://cancel.url"
    },
    transactions: [
      {
        item_list: cart.forEach(cartItem => {
          items.push({
            name: cartItem.title,
            price: cartItem.price,
            quantity: cartItem.qty
          });
        }),
        amount: {
          currency: "INR",
          total: cart.total
        },
        description: "This is the payment description."
      }
    ]
  };
  console.log("Item list: ", create_payment_json.item_list);
  console.log(
    "Output: ",
    create_payment_json.transactions.item_list.amount.total
  );
});
// Exports
module.exports = router;
