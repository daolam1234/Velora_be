import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
  user_id: String,
  products: [
    {
      product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product", // tên model bạn đã đặt cho sản phẩm
      },
      addedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const Wishlist = mongoose.model("Wishlist", wishlistSchema, "wishlists");
export default Wishlist;