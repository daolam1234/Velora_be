import Joi from 'joi';

export const createVariantSchema = Joi.object({
  product_id: Joi.string()
    .required()
    .regex(/^[0-9a-fA-F]{24}$/)
    .message('product_id không hợp lệ'),

  size: Joi.string()
    .max(10)
    .required(),

  sku: Joi.string()
    .max(100)
    .required(),

  price: Joi.number()
    .min(0)
    .required(),

  stock_quantity: Joi.number()
    .integer()
    .min(0)
    .required(),

  is_available: Joi.boolean().optional(),

  isDeleted: Joi.boolean().optional(),
});

export const updateVariantSchema = Joi.object({
  product_id: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .message('product_id không hợp lệ')
    .optional(),

  size: Joi.string()
    .max(10)
    .optional(),

  sku: Joi.string()
    .max(100)
    .optional(),

  price: Joi.number()
    .min(0)
    .optional(),

  stock_quantity: Joi.number()
    .integer()
    .min(0)
    .optional(),

  is_available: Joi.boolean().optional(),

  isDeleted: Joi.boolean().optional(),
}).min(1); // ít nhất 1 trường phải có
