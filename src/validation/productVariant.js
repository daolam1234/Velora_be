import Joi from "joi";
import mongoose from "mongoose";

// Custom validator cho ObjectId
const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

export const createVariantSchema = Joi.object({
  product_id: Joi.string()
    .custom(objectId)
    .required()
    .messages({
      "any.invalid": "product_id không hợp lệ",
      "any.required": "product_id là bắt buộc",
    }),

  size: Joi.string()
    .custom(objectId)
    .required()
    .messages({
      "any.invalid": "size_id không hợp lệ",
      "any.required": "size là bắt buộc",
    }),

  color: Joi.string()
    .custom(objectId)
    .required()
    .messages({
      "any.invalid": "color_id không hợp lệ",
      "any.required": "color là bắt buộc",
    }),

image: Joi.string().allow(null, "").optional(),
  images: Joi.array().items(Joi.string().uri()).optional(),

  sku: Joi.string().max(100).required(),
  price: Joi.number().min(0).required(),
  discount_price: Joi.number().min(0).optional(),
  stock_quantity: Joi.number().integer().min(0).required(),

  is_available: Joi.boolean().optional(),
  isDeleted: Joi.boolean().optional(),
});

export const updateVariantSchema = Joi.object({
  product_id: Joi.string().custom(objectId).optional(),
  size: Joi.string().custom(objectId).optional(),
  color: Joi.string().custom(objectId).optional(),
  image: Joi.string().allow(null, "").optional(),
images: Joi.array().items(Joi.string()).optional(),
  sku: Joi.string().max(100).optional(),
  price: Joi.number().min(0).optional(),
  discount_price: Joi.number().min(0).optional(),
  stock_quantity: Joi.number().integer().min(0).optional(),
  is_available: Joi.boolean().optional(),
  isDeleted: Joi.boolean().optional(),
}).min(1);
