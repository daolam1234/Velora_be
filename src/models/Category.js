import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      maxlength: 100,
    },
    description: {
      type: String,
    },
    image_url: {
      type: String,
      maxlength: 255,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,   
    versionKey: false,  
  }
);

const Category = mongoose.model("Category", categorySchema);

export default Category;
