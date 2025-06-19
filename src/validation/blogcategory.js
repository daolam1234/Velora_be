import Joi from "joi";

export const blogCategoryValid = Joi.object({
  name: Joi.string().max(100).required().messages({
    "string.empty": "Tên danh mục blog không được để trống",
    "any.required": "Vui lòng nhập tên danh mục blog",
  }),
  description: Joi.string().allow(""),
});
