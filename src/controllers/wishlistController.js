import Wishlist from "../models/Wishlist.js";

// Lấy danh sách yêu thích của user
export const getWishlist = async (req, res) => {
  try {
    const { user_id } = req.params;

    const wishlist = await Wishlist.findOne({ user_id })
      .populate("products.product_id"); 

    if (!wishlist) return res.status(200).json([]);

    // Trả về danh sách sản phẩm đã được populate
    const populatedProducts = wishlist.products.map((item) => ({
      ...item.product_id._doc, // chứa name, price, image,...
      addedAt: item.addedAt,
    }));

    res.json(populatedProducts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Thêm sản phẩm vào wishlist
export const addToWishlist = async (req, res) => {
  try {
    const { user_id, product_id } = req.body;
    let wishlist = await Wishlist.findOne({ user_id });

    if (!wishlist) {
      wishlist = new Wishlist({
        user_id,
        products: [{ product_id, addedAt: new Date() }],
      });
    } else {
const exists = wishlist.products.find(
  (p) => p.product_id.toString() === product_id
);
      if (exists)
        return res
          .status(409)
          .json({ message: "Sản phẩm đã có trong danh sách yêu thích!" });
      wishlist.products.push({ product_id, addedAt: new Date() });
    }

    await wishlist.save();
    res.status(201).json(wishlist.products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xóa sản phẩm khỏi wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const { user_id, product_id } = req.body;

    const wishlist = await Wishlist.findOne({ user_id });
    if (!wishlist)
      return res.status(404).json({ message: "Không tìm thấy wishlist" });

    // So sánh ObjectId.toString() với string
    wishlist.products = wishlist.products.filter(
      (p) => p.product_id.toString() !== product_id
    );

    await wishlist.save();
    res.json({ message: "Đã xóa khỏi wishlist" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};