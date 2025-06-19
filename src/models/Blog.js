import mongoose from "mongoose";
import slugify from "slugify";

const blogPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    excerpt: {
      type: String,
      maxlength: 500,
    },
    thumbnail: {
      type: String, // Ảnh đại diện chính
      required: true,
    },
    content: {
      type: String, // Nội dung HTML có thể chứa ảnh chèn giữa
      required: true,
    },
    images: [
      {
        url: { type: String, required: true }, // ảnh chèn giữa (nếu bạn muốn lưu riêng)
        caption: { type: String },
        alt: { type: String },
      },
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BlogCategory",
      required: true,
    },
    author: {
      type: String,
      default: "Admin",
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    views: {
      type: Number,
      default: 0,
    },
    
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Tự động tạo slug từ title nếu chưa có
blogPostSchema.pre("validate", function (next) {
  if (this.isModified("title") || !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

const BlogPost = mongoose.model("BlogPost", blogPostSchema);
export default BlogPost;
