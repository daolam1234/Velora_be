import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { sendSuccess } from "../middlewares/success.middleware.js";
import { CART_MESSAGES } from "../constant/messages.js";
import ProductVariant from "../models/ProductVariant.js";
import { STATUS_CODES } from "../constant/statusCodes.js";

// Thêm sản phẩm vào giỏ hàng
export const addToCart = async (req, res, next) => {
  try {
    const product_id = req.body.product_id;
    const quantity = parseInt(req.body.quantity);
    const variant_id = req.body.variant_id;
    const user_id = req.user._id;
   

    if(!product_id || !quantity || !variant_id) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
            success: false,
            message: CART_MESSAGES.INVALID_INPUT
        });
    }

    // Validate quantity
    if (!quantity || quantity <= 0) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: CART_MESSAGES.QUANTITY_REQUIRED
      });
    }

    // Kiểm tra sản phẩm tồn tại
    const product = await Product.findOne({ _id: product_id, isDeleted: false });
    if (!product) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: CART_MESSAGES.PRODUCT_NOT_FOUND
      });
    }

    // Kiểm tra xem variant_id có hợp lệ không nếu được cung cấp
    if (variant_id) {
      const variant = await ProductVariant.findOne({
        _id: variant_id,
        product_id: product_id,
        isDeleted: false
      });
      if (!variant) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: CART_MESSAGES.INVALID_VARIANT
        });
      }
    }

    // Kiểm tra stock dựa trên biến thể nếu có
    let availableStock = product.stock_quantity;
    let selectedVariant = null;
    if (variant_id) {
      selectedVariant = await ProductVariant.findOne({ _id: variant_id, product_id: product_id, isDeleted: false });
      if (!selectedVariant) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: CART_MESSAGES.VARIANT_NOT_FOUND
        });
      }
      availableStock = selectedVariant.stock_quantity;
    }

    if (availableStock < quantity) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: variant_id ? CART_MESSAGES.INSUFFICIENT_VARIANT_STOCK : CART_MESSAGES.INSUFFICIENT_STOCK
      });
    }

    // Trừ số lượng tồn kho
    if (variant_id) {
      selectedVariant.stock_quantity -= quantity;
      await selectedVariant.save();
    } else {
      product.stock_quantity -= quantity;
      await product.save();
    }

    // Tìm hoặc tạo giỏ hàng
    let cart = await Cart.findOne({ user: user_id });
    if (!cart) {
      cart = new Cart({ user: user_id, items: [] });
    }

    // Kiểm tra sản phẩm đã có trong giỏ chưa
    const existingItem = cart.items.find(
      item => item.product.toString() === product_id &&
              (variant_id ? item.variant?.toString() === variant_id : !item.variant)
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        product: product_id,
        quantity,
        variant: variant_id || undefined
      });
    }

    await cart.save();

    // Populate thông tin sản phẩm và thêm thông tin biến thể
    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: "items.product",
        select: "name price discount_price images variation_status stock_quantity"
      })
    .populate({
  path: "items.variant",
  select: "size price stock_quantity sku color discount_price image images"
});
    // Thêm thông tin chi tiết biến thể vào phản hồi
    const cartWithVariantDetails = populatedCart.items.map(item => {
        const product = item.product;
        let variantDetails = null;

        if (item.variant && product && product.variants) {
             variantDetails = product.variants.find(v => v._id.toString() === item.variant.toString());
        }

        return {
            ...item.toObject(),
            product_id: product ? product.toObject() : null,
            variantDetails: variantDetails ? variantDetails.toObject() : null
        };
    });

    sendSuccess(res, {
        products: cartWithVariantDetails,
        totalPrice: cartWithVariantDetails.reduce((total, item) => {
            const product = item.product_id;
            const price = product
              ? (product.discount_price && product.discount_price > 0
                  ? product.discount_price
                  : product.price)
              : 0;
            return total + (price * item.quantity);
        }, 0)
    }, CART_MESSAGES.ADD_SUCCESS);
  } catch (error) {
    next(error);
  }
};

// Cập nhật số lượng sản phẩm trong giỏ
// ✅ Cập nhật số lượng sản phẩm trong giỏ
export const updateCartItem = async (req, res, next) => {
  try {
    const { product_id, variant_id, quantity } = req.body;
    const user_id = req.user._id;

    // ✅ Validate quantity
    if (!quantity || quantity <= 0) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: CART_MESSAGES.QUANTITY_REQUIRED
      });
    }

    // ✅ Kiểm tra sản phẩm tồn tại
    const product = await Product.findOne({ _id: product_id, isDeleted: false }).lean();
    if (!product) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: CART_MESSAGES.PRODUCT_NOT_FOUND
      });
    }

    // ✅ Kiểm tra biến thể nếu có
    let availableStock = product.stock_quantity;
    if (variant_id) {
      const selectedVariant = product.variants?.find(
        (v) => v._id.toString() === variant_id
      );

      if (!selectedVariant) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: CART_MESSAGES.VARIANT_NOT_FOUND
        });
      }

      availableStock = selectedVariant.stock_quantity;
    }

    // ✅ Kiểm tra số lượng còn đủ không
    if (availableStock < quantity) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: CART_MESSAGES.INSUFFICIENT_STOCK
      });
    }

    // ✅ Tìm giỏ hàng
    const cart = await Cart.findOne({ user: user_id });
    if (!cart) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: CART_MESSAGES.NOT_FOUND
      });
    }

    // ✅ Tìm sản phẩm trong giỏ
    const productIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === product_id &&
        ((variant_id && item.variant?.toString() === variant_id) || (!variant_id && !item.variant))
    );

    if (productIndex === -1) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: CART_MESSAGES.ITEM_NOT_FOUND
      });
    }

    // ✅ Cập nhật quantity
    cart.items[productIndex].quantity = quantity;
    await cart.save();

    // ✅ Populate để trả về dữ liệu đầy đủ
    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: "items.product",
        select: "name price discount_price images variation_status stock_quantity"
      })
      .populate({
        path: "items.variant",
        select: "size price stock_quantity sku color discount_price image images"
      });

    sendSuccess(res, populatedCart, CART_MESSAGES.UPDATE_SUCCESS);
  } catch (error) {
    next(error);
  }
};



// ✅ Xóa 1 sản phẩm (hoặc sản phẩm + biến thể) khỏi giỏ hàng
export const removeFromCart = async (req, res, next) => {
  try {
    const { product_id, variant_id } = req.body;
    const user_id = req.user._id;

    if (!product_id) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: CART_MESSAGES.INVALID_INPUT
      });
    }

    const cart = await Cart.findOne({ user: user_id });
    if (!cart || cart.items.length === 0) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: CART_MESSAGES.NOT_FOUND
      });
    }

    // ✅ Tìm item khớp product và variant (nếu có)
    const itemIndex = cart.items.findIndex(
      item =>
        item.product.toString() === product_id &&
        (variant_id ? item.variant?.toString() === variant_id : !item.variant)
    );

    if (itemIndex === -1) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: CART_MESSAGES.ITEM_NOT_FOUND_TO_REMOVE
      });
    }

    // ✅ Trả lại toàn bộ số lượng về kho
    const qtyToReturn = cart.items[itemIndex].quantity;
    if (variant_id) {
      await ProductVariant.findByIdAndUpdate(
        variant_id,
        { $inc: { stock_quantity: qtyToReturn } }
      );
    } else {
      await Product.findByIdAndUpdate(
        product_id,
        { $inc: { stock_quantity: qtyToReturn } }
      );
    }

    // ✅ Xóa item khỏi giỏ
    cart.items.splice(itemIndex, 1);
    await cart.save();

    // ✅ Populate lại giỏ hàng
    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: "items.product",
        select: "name price discount_price images variation_status stock_quantity"
      })
      .populate({
        path: "items.variant",
        select: "size price stock_quantity sku color discount_price image images"
      });

    sendSuccess(res, populatedCart, CART_MESSAGES.REMOVE_SUCCESS);
  } catch (error) {
    next(error);
  }
};


// // Xóa toàn bộ giỏ hàng
// export const clearCart = async (req, res, next) => {
//   try {
//     const user_id = req.user._id;

//     const cart = await Cart.findOne({ user: user_id });
//     if (!cart || cart.items.length === 0) {
//       return res.status(STATUS_CODES.NOT_FOUND).json({
//         success: false,
//         message: CART_MESSAGES.EMPTY_CART
//       });
//     }

//     // Trả lại số lượng tồn kho cho từng sản phẩm/biến thể
//     for (const item of cart.items) {
//       if (item.variant) {
//         await ProductVariant.findByIdAndUpdate(
//           item.variant,
//           { $inc: { stock_quantity: item.quantity } }
//         );
//       } else {
//         await Product.findByIdAndUpdate(
//           item.product,
//           { $inc: { stock_quantity: item.quantity } }
//         );
//       }
//     }
//     cart.items = [];
//     await cart.save();

//     sendSuccess(res, { products: [], totalPrice: 0 }, CART_MESSAGES.CLEAR_SUCCESS);
//   } catch (error) {
//     next(error);
//   }
// };



// Lấy chi tiết giỏ hàng
export const getCart = async (req, res, next) => {
  try {
    const user_id = req.user._id;

    const cart = await Cart.findOne({ user: user_id })
      .populate({
        path: "items.product",
        select: "name price discount_price images variation_status stock_quantity"
      })
  .populate({
  path: "items.variant",
  select: "size price stock_quantity sku color discount_price image images"
});
    if (!cart) {
      return sendSuccess(res, { products: [] }, CART_MESSAGES.EMPTY_CART);
    }

    const cartWithVariantDetails = cart.items.map(item => {
        const product = item.product;
        const variant = item.variant;
        let variantDetails = null;
        let status = "available";
        let message = "";

        // Kiểm tra trạng thái sản phẩm
        if (!product || product.isDeleted === true) {
            status = "not_found";
            message = CART_MESSAGES.PRODUCT_NOT_FOUND; // "Sản phẩm không tồn tại"
        } else if (item.variant) {
            // Nếu có variant, kiểm tra tồn kho variant
            variantDetails = variant;
            if (variantDetails && variantDetails.stock_quantity <= 0) {
                status = "unavailable";
                message = CART_MESSAGES.VARIANT_IS_DELETE || "Biến thể này hiện không còn bán";
            }
        }

        return {
          ...item.toObject(),
          product_id: product ? product.toObject() : null,
          variantDetails: variantDetails ? variantDetails.toObject ? variantDetails.toObject() : variantDetails : null,
          status,
          message
        };
    });

    const totalPrice = cartWithVariantDetails.reduce((total, item) => {
      const product = item.product_id;
      const price = product
        ? (product.discount_price && product.discount_price > 0
            ? product.discount_price
            : product.price)
        : 0;
      return total + (price * item.quantity);
    }, 0);

    sendSuccess(res, {
      products: cartWithVariantDetails,
      totalPrice
    }, CART_MESSAGES.GET_SUCCESS);
  } catch (error) {
    next(error);
  }
};