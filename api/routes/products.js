const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const Product = require('../models/product');

const router = express.Router();
const storage = multer.diskStorage({
  filename: (req, file, callback) => {
    callback(null, new Date().toISOString() + file.originalname);
  },
  destination: (req, file, callback) => {
    callback(null, './uploads');
  },
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({ storage, fileFilter });

router.get('/', (req, res, next) => {
  Product.find()
    .select('_id name price')
    .exec()
    .then((docs) => {
      const response = {
        count: docs?.length,
        products:
          docs?.map((el) => {
            return {
              _id: el?._id,
              name: el?.name,
              price: el?.price,
              request: {
                type: 'GET',
                url: 'http://localhost:3000/products/' + el?._id,
              },
            };
          }) || [],
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

router.post('/', upload.single('productImage'), (req, res, next) => {
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req?.body?.name,
    price: req?.body?.price,
  });
  product
    .save()
    .then((doc) => {
      res.status(201).json({
        message: 'product created successfullly',
        createdProduct: {
          _id: doc?._id,
          name: doc?.name,
          price: doc?.price,
          request: {
            type: 'GET',
            url: 'http://localhost:3000/products/' + doc?._id,
          },
        },
      });
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});

router.get('/:productId', (req, res, next) => {
  const id = req.params.productId;
  Product.findById(id)
    .select('_id name price')
    .then((doc) => {
      console.log(doc);
      if (doc) {
        res.status(200).json(doc);
      } else {
        res
          .status(404)
          .json({ message: 'no valid document found for given _id' });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.patch('/:productId', (req, res, next) => {
  const id = req.params.productId;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  Product.findByIdAndUpdate(id, { $set: updateOps })
    .exec()
    .then((result) => {
      console.log(result);
      res.status(200).json(result);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.delete('/:productId', (req, res, next) => {
  const id = req.params.productId;
  Product.findByIdAndRemove(id)
    .exec()
    .then((doc) => {
      console.log(doc);
      res.status(200).json(doc);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

module.exports = router;
