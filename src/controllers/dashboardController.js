import Category from '../models/Category.js';
import Product from '../models/Product.js';
import ProductVariant from '../models/ProductVariant.js';
import Blog from '../models/Blog.js';
import User from '../models/User.js';
import Coupon from '../models/Coupon.js';
import Order from '../models/Order.js';

export const getDashboardOverview = async (req, res) => {
  try {
  // Bỏ totalRevenueResult khỏi Promise.all
const [
  totalProducts,
  totalVariants,
  totalBlogs,
  totalUsers,
  totalCoupons,
  totalOrders,
  topSellingProducts
] = await Promise.all([
  Product.countDocuments({ isDeleted: false }),
  ProductVariant.countDocuments({ isDeleted: false }),
  Blog.countDocuments({ isDeleted: false }),
  User.countDocuments(),
  Coupon.countDocuments({ isDeleted: false }),
Order.countDocuments(),
  Product.aggregate([
    { $match: { isDeleted: false } },
    { $project: { name: 1, sold: 1, price: 1, totalRevenue: { $multiply: ["$sold", "$price"] } } },
    { $sort: { sold: -1 } },
    { $limit: 5 }
  ])
]);

const totalRevenueResult = await Order.aggregate([
  {
    $match: {
      isDeleted: false,
      status: "completed"
    },
  },
  {
    $group: {
      _id: null,
      total: { $sum: "$finalAmount" },
    },
  },
]);

const totalRevenue = totalRevenueResult[0]?.total || 0;

    return res.status(200).json({
      success: true,
      message: "Lấy dữ liệu tổng quan thành công",
      data: {
        totalProducts,
        totalVariants,
        totalBlogs,
        totalUsers,
        totalCoupons,
        totalOrders,
        totalRevenue,
        topSellingProducts
      }
    });
  } catch (error) {
    console.error("Lỗi dashboard overview:", error);
    return res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

export const getRevenueByFilter = async (req, res) => {
  try {
    const { range = 7 } = req.query;
    const days = Number(range);
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);


    // Bỏ isDeleted vì bạn không dùng soft delete
    const ordersTest = await Order.find({
      status: "completed",
      createdAt: { $gte: fromDate },
    });

    const revenues = await Order.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: fromDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%d/%m", date: "$createdAt" } },
          revenue: { $sum: "$finalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);


    return res.status(200).json({
      success: true,
      message: `Doanh thu ${days} ngày gần nhất`,
      data: revenues,
    });
  } catch (error) {
    console.error("Lỗi getRevenueByFilter:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};



export const getTopSellingProducts = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 5;

    const result = await Order.aggregate([
      { $match: { status: "completed" } }, // Chỉ lấy đơn hàng đã hoàn tất
      { $unwind: "$items" }, // Tách từng sản phẩm trong đơn
      {
        $group: {
          _id: "$items.productId",
          sold: { $sum: "$items.quantity" },
          price: { $first: "$items.price" }, // Lấy giá tại thời điểm bán (snapshot)
          name: { $first: "$items.productName" }, // Lấy tên snapshot
        },
      },
      {
        $project: {
          name: 1,
          sold: 1,
          price: 1,
          totalRevenue: { $multiply: ["$sold", "$price"] },
        },
      },
      { $sort: { sold: -1 } },
      { $limit: limit },
    ]);

    res.status(200).json({
      success: true,
      message: "Lấy top sản phẩm bán chạy thành công",
      data: result,
    });
  } catch (error) {
    console.error("Lỗi getTopSellingProducts:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};
