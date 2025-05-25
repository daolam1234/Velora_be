import Product from '../models/Product.js';

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    if (!products) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: messages.PRODUCT_MESSAGES.NOT_FOUND });
    }
    return res.status(STATUS_CODES.OK).json(products)
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({ message: messages.PRODUCT_MESSAGES.SERVER_ERROR, error: error.message });

  }
};

export const getProductsByCategory = async (req, res) => {
  const { categoryId } = req.params;

  try {
    const products = await Product.find({ category_id: categoryId });

    if (!products || products.length === 0) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: messages.PRODUCT_MESSAGES.NOT_FOUND_IN_CATEGORY });
    }

    return res.status(STATUS_CODES.OK).json(products);
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({ message: messages.PRODUCT_MESSAGES.SERVER_ERROR, error: error.message });
  }
};


export const getProductDetail = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findOne({ _id: id });

    if (!product) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: messages.PRODUCT_MESSAGES.NOT_FOUND });
    }

    res.status(STATUS_CODES.OK).json(product);
  } catch (error) {
    res.status(STATUS_CODES.SERVER_ERROR).json({ message: messages.PRODUCT_MESSAGES.SERVER_ERROR, error: error.message });
  }
};

export const createProduct = async (req, res) => {
  const {
    _id,
    name,
    category_id,
    description,
    price,
    stock_quantity,
    image_url,
    is_available,
  } = req.body;
  console.log("BODY:", req.body);
  if (!name || !category_id || !price) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({ message: messages.PRODUCT_MESSAGES.SERVER_ERROR });
  }
  try {
    const newProduct = new Product({
      ...req.body,
    });

    await newProduct.save();
    res.status(STATUS_CODES.CREATED).json({ message: messages.PRODUCT_MESSAGES.CREATE_SUCCESS, product: newProduct });
  } catch (error) {
    res.status(STATUS_CODES.SERVER_ERROR).json({ message: messages.PRODUCT_MESSAGES.SERVER_ERROR, error: error.message });
  }
};


export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedProduct) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: messages.PRODUCT_MESSAGES.NOT_FOUND });
    }

    res.status(STATUS_CODES.OK).json({ message: messages.PRODUCT_MESSAGES.UPDATE_SUCCESS, product: updatedProduct });
  } catch (error) {
    res.status(STATUS_CODES.SERVER_ERROR).json({ message: messages.PRODUCT_MESSAGES.SERVER_ERROR, error: error.message });
  }
};


export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: messages.PRODUCT_MESSAGES.NOT_FOUND });
    }

    res.status(STATUS_CODES.OK).json({ message: messages.PRODUCT_MESSAGES.DELETE_SUCCESS, product: deletedProduct });
  } catch (error) {
    res.status(STATUS_CODES.SERVER_ERROR).json({ message: messages.PRODUCT_MESSAGES.SERVER_ERROR, error: error.message });
  }
};



