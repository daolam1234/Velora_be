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


