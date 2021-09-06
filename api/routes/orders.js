const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Order = require('../models/order');
const Product = require('../models/product');

router.get('/', (req, res, next) => {
  Order.find()
    .populate('product', '_id name price')
    .exec()
    .then((docs) => {
      res.status(200).json(docs);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});

router.post('/', (req, res, next) => {
  Product.findById(req?.body?.productId)
    .then((product) => {
      if (!product) {
        return res.status(404).json({ message: 'product not found' });
      }
      const order = new Order({
        _id: mongoose.Types.ObjectId(),
        product: req?.body?.productId,
        quantity: req?.body?.quantity,
      });
      return order.save();
    })
    .then((result) => {
      res.status(201).json({
        message: 'order was created',
        result,
      });
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});

router.get('/:orderId', (req, res, next) => {
  Order.findById(req.params.orderId)
    .exec()
    .then((order) => {
      res.status(200).json(order);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});

router.delete('/:orderId', (req, res, next) => {
  Order.findByIdAndUpdate(req.params.orderId)
    .exec()
    .then((result) => {
      res.status(200).json({
        message: 'order deleted',
        result: result,
      });
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});

module.exports = router;
