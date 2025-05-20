import  Product  from '../models/Product.js';

 export const getProducts = async (req,res) => {
  try {
    const products = await Product.find(); // lấy tất cả sản phẩm
	if(!products){
    return res.status(400).json({message:"ko ton tai trang"})
	}
	return res.status(200).json(products)
  } catch (error) {
       return res.status(500).json({message:"loi server"})

  }
};

export const getProductsByCategory = async (req, res) => {
  const { categoryId } = req.params;

  try {
    const products = await Product.find({ category_id: categoryId });

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "Không có sản phẩm trong danh mục này" });
    }

    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};


export const getProductDetail = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findOne({_id: id });

        if (!product) {
            return res.status(404).json({ message: "Không có sản phẩm" });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
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

  try {
    const newProduct = new Product({
      _id,
      name,
      category_id,
      description,
      price,
      stock_quantity,
      image_url,
      is_available,
    });

    await newProduct.save();
    res.status(201).json({ message: "Tạo sản phẩm thành công", product: newProduct });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};


export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ message: "Không có sản phẩm" });
    }

    res.status(200).json({ message: "Cập nhật sản phẩm thành công", product: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};


export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Không có sản phẩm" });
    }

    res.status(200).json({ message: "Xóa sản phẩm thành công", product: deletedProduct });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};



