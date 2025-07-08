import Joi from "joi";

export const productSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.base": "Tên sản phẩm phải là chuỗi",
    "string.empty": "Tên sản phẩm không được để trống",
    "any.required": "Tên sản phẩm là bắt buộc",
  }),

  category_id: Joi.string().required().messages({
    "string.base": "ID danh mục phải là chuỗi",
    "string.empty": "ID danh mục không được để trống",
    "any.required": "ID danh mục là bắt buộc",
  }),

  origin: Joi.string().optional(),

    brand: Joi.string().required().messages({
    "any.required": "Thương hiệu không được để trống",
    "string.empty": "Thương hiệu không được để trống",
  }),
  
  description: Joi.string().optional(),

  images: Joi.array().items(Joi.string().uri()).min(1).required().messages({
    "array.base": "Images phải là một mảng",
    "array.min": "Cần ít nhất 1 ảnh cho sản phẩm",
    "any.required": "Trường images là bắt buộc",
  }),


  price: Joi.number().min(0).required().messages({
    "number.base": "Giá phải là số",
    "number.min": "Giá không được nhỏ hơn 0",
    "any.required": "Giá là bắt buộc",
  }),

  discount_price: Joi.number().min(0).optional(),

  variation_status: Joi.boolean().optional(),
});
