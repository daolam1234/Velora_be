import mongoose from "mongoose";

const productImageSchema = new mongoose.Schema(
    {
        _id: { type: String },
        product_id: { type: String, required: true },
        image_url: { type: String, required: true },
        position: { type: Number, required: true },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    }

);

const productImageModel = mongoose.model("ProductImage", productImageSchema);

export default productImageModel;