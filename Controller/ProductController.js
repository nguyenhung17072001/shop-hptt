import mongoose from 'mongoose';
import Product from '../Models/ProductModels.js';
import Queue from '../Models/QueueModels.js';
import asyncHandler from 'express-async-handler';
import User from '../Models/UserModels.js';

// api create product

const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    category,
    description,
    quantity,
    sizes,
    colors,
    gender,
    price,
    images,
  } = req.body;

  if (
    !name ||
    !category ||
    !description ||
    !quantity ||
    !gender ||
    !sizes ||
    !colors ||
    !price ||
    !images
  ) {
    return res.status(400).json({ error: 'Missing required field' });
  }

  // create a new product
  const product = new Product({
    name,
    category,
    description,
    quantity,
    sizes,
    gender,
    colors,
    price,
    images,
  });
  product
    .save()
    .then(() => {
      res.status(201).json({ message: 'Product created successfully' });
    })
    .catch((error) => {
      res.status(500).json({ error: 'Failed to create product', error });
    });
});

const showAllProducts = asyncHandler(async (req, res) => {
  try {
    const allProducts = await Product.find({});

    res.status(200).json({ success: true, data: allProducts });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching products' });
  }
});
const addProductsToQueue = asyncHandler(async (req, res) => {
  const { idUser, idProduct } = req.body;

  if (!idUser || !idProduct || !Array.isArray(idProduct)) {
    return res.status(400).json({ success: false, error: 'Invalid data provided' });
  }

  try {
    const newQueue = await Queue.create({ user_id: idUser, products: idProduct, isConfirm: 0 });

    res.status(201).json({ success: true, data: newQueue });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error adding products to queue' });
  }
});

const getQueueList = asyncHandler(async (req, res) => {
  try {
    const queueList = await Queue.find({}).populate('products', 'name price'); // Sử dụng populate để lấy thông tin sản phẩm

    res.status(200).json({ success: true, data: queueList });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching queue list' });
  }
});

const getQueueListWithIsConfirmZero = asyncHandler(async (req, res) => {
  try {
    const queueList = await Queue.find({ isConfirm: 0 }).populate('products', 'name price');

    res.status(200).json({ success: true, data: queueList });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching queue list with isConfirm 0' });
  }
});

const getQueueListWithIsConfirmOne = asyncHandler(async (req, res) => {
  try {
    const queueList = await Queue.find({ isConfirm: 1 }).populate('products', 'name price');

    res.status(200).json({ success: true, data: queueList });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching queue list with isConfirm 0' });
  }
});

const getQueueListWithIsConfirmTwo = asyncHandler(async (req, res) => {
  try {
    const queueList = await Queue.find({ isConfirm: 2 }).populate('products', 'name price');

    res.status(200).json({ success: true, data: queueList });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching queue list with isConfirm 0' });
  }
});

const updateIsConfirm = asyncHandler(async (req, res) => {
  const { queueId, newIsConfirmValue } = req.body;

  if (!queueId || !newIsConfirmValue || ![0, 1, 2].includes(newIsConfirmValue)) {
    return res.status(400).json({ success: false, error: 'Invalid data provided' });
  }

  try {
    const updatedQueue = await Queue.findByIdAndUpdate(queueId, { isConfirm: newIsConfirmValue }, { new: true });

    if (!updatedQueue) {
      return res.status(404).json({ success: false, error: 'Queue not found' });
    }

    res.status(200).json({ success: true, data: updatedQueue });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error updating isConfirm in queue' });
  }
});



const showProductGender = asyncHandler(async (req, res) => {
  try {
    console.log("==llllllllllllllllllll=================")
    const { gender } = req.params;

    // Validate if the provided gender is valid
    if (!['M', 'L'].includes(gender)) {
      return res.status(400).json({ message: 'Invalid gender parameter.' });
    }

    // Query products based on the specified gender
    const products = await Product.find({ gender });

    // You can customize the response based on your needs
    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});
const showTrendProduct = asyncHandler(async (req, res) => {
  try {
    const trendingProducts = await Product.aggregate([
      {
        $addFields: {
          avgRating: { $avg: "$rate" } // Tính trung bình rating của sản phẩm
        }
      },
      {
        $sort: { avgRating: -1 } // Sắp xếp theo trung bình rating giảm dần
      },
      {
        $limit: 6 // Giới hạn số lượng sản phẩm lấy ra là 6
      }
    ]);

    res.status(200).json({ success: true, data: trendingProducts });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching trending products' });
  }
});

const showNewProducts = asyncHandler(async (req, res) => {
  try {
    // Lấy ngày hiện tại
    const currentDate = new Date();
    console.log("===================")
    // Tìm 5 sản phẩm có createdAt gần với hôm nay nhất
    const newProducts = await Product.find()
      .sort({ created_at: -1 }) // Sắp xếp giảm dần theo created_at
      .limit(5);

    res.json(newProducts);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}) 

// api updateProduct
const updateProduct = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      quantity,
      sizes,
      gender,
      colors,
      price,
      images,
    } = req.body;
    const product = await Product.findById(req.params.id);
    /* console.log('userId: ' + userId); */
    if (product) {
      product.name = name || product.name;
      product.category = category || product.category;
      product.description = description || product.description;
      product.quantity = quantity || product.quantity;
      product.sizes = sizes || product.sizes;
      product.gender = gender || product.gender;
      product.colors = colors || product.colors;
      product.price = price || product.price;
      product.images = images || product.images;
      const updatedProduct = await product.save();
      res.status(200).json(updatedProduct);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// api deleteProduct

const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    /* console.log(product); */
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    await product.deleteOne();
    res.json({ message: 'Product removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// view details product
const viewDetailProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404);
      throw new Error('Không tìm thấy sản phẩm');
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// create review product

const createReviewProduct = asyncHandler(async (req, res) => {
  const { rating, comment, images } = req.body;
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      const alreadyReview = product.comments.find(
        (r) => r.userId.toString() === req.user._id.toString()
      );
      if (alreadyReview) {
        res.status(400);
        throw new Error('You already review this movie');
      }
      // else create a new movie
      const review = {
        userName: req.user.fullName,
        userId: req.user._id,
        userImage: req.user.images,
        rating: Number(rating),
        comment,
        images,
      };
      product.comments.push(review);
      product.numberOfReviews = product.comments.length;
      product.rate =
        product.comments.reduce((acc, item) => item.rating + acc, 0) /
        product.comments.length;

      await product.save();
      res.status(201).json({
        message: 'Review addded',
      });
    } else {
      res.status(404);
      throw new Error('Movie not found');
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// delete review products

const deleteReviewProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    /* console.log(product); */
    if (product) {
      const reviewIndex = product.comments.findIndex(
        (r) => r._id.toString() === req.params.reviewId
      );
      /* console.log(product.comments); */
      /* console.log(reviewIndex); */
      /* console.log(reviewIndex); */
      if (reviewIndex !== -1) {
        const review = product.comments[reviewIndex];
        /* console.log(review); */
        // Kiểm tra quyền của người dùng hiện tại
        if (review.userId.toString() !== req.user._id.toString()) {
          res.status(403);
          throw new Error('Bạn không có quyền xóa đánh giá và bình luận này');
        }

        // Tiến hành xóa đánh giá và bình luận
        product.comments.splice(reviewIndex, 1);
        product.numberOfReviews = product.comments.length;

        if (product.comments.length > 0) {
          product.rate =
            product.comments.reduce((acc, item) => item.rating + acc, 0) /
            product.comments.length;
        } else {
          product.rate = 0;
        }

        await product.save();
        res.status(200).json({
          message: 'Đánh giá đã được xóa',
        });
      } else {
        res.status(404);
        throw new Error('Không tìm thấy đánh giá');
      }
    } else {
      res.status(404);
      throw new Error('Không tìm thấy sản phẩm');
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export {
  createProduct,
  updateProduct,
  deleteProduct,
  viewDetailProduct,
  createReviewProduct,
  deleteReviewProduct,
  showProductGender,
  showNewProducts,
  showTrendProduct,
  showAllProducts,
  addProductsToQueue,
  getQueueList,
  getQueueListWithIsConfirmZero,
  getQueueListWithIsConfirmOne,
  getQueueListWithIsConfirmTwo,
  updateIsConfirm,
};
