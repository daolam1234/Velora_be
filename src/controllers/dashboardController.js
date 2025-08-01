import Category from '../models/Category.js';
import Product from '../models/Product.js';
import ProductVariant from '../models/ProductVariant.js';
import Blog from '../models/Blog.js';
import User from '../models/User.js';
import Coupon from '../models/Coupon.js';
import Order from '../models/Order.js';

// Helper: parse ngày đầu vào
const getDateRange = (query) => {
  const { from, to } = query;

  if (from && to) {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    return { fromDate, toDate };
  }

  return { fromDate: null, toDate: null };
};

// Helper: Tạo điều kiện createdAt nếu có ngày
const makeDateFilter = (fromDate, toDate) => {
  if (fromDate && toDate) {
    return { $gte: fromDate, $lte: toDate };
  }
  return undefined;
};


export const getDashboardOverview = async (req, res) => {
  try {
    const { fromDate, toDate } = getDateRange(req.query);
    const dateFilter = makeDateFilter(fromDate, toDate);

    const usersStillExists = await User.find({}, '_id');
const validUserIds = usersStillExists.map((u) => u._id);

    const [
      totalProducts,
      totalVariants,
      totalBlogs,
      totalUsers,
      totalCoupons,
      totalOrders,
      topSellingProducts,
      totalRevenueResult,
    ] = await Promise.all([
      Product.countDocuments({
        isDeleted: false,
        ...(dateFilter && { createdAt: dateFilter }),
      }),
      ProductVariant.countDocuments({
        isDeleted: false,
        ...(dateFilter && { created_at: dateFilter }),
      }),
      Blog.countDocuments({
        isDeleted: false,
        ...(dateFilter && { createdAt: dateFilter }),
      }),
      User.countDocuments({
        is_deleted: false,
        ...(dateFilter && { created_at: dateFilter }),
        
      }),
      Coupon.countDocuments({
        isDeleted: false,
        ...(dateFilter && { createdAt: dateFilter }),
      }),
       Order.countDocuments({
    status: 'completed',
    ...(dateFilter && { createdAt: dateFilter }),
  }),
      Product.aggregate([
        { $match: { isDeleted: false } },
        {
          $project: {
            name: 1,
            sold: 1,
            price: 1,
            totalRevenue: { $multiply: ['$sold', '$price'] },
          },
        },
        { $sort: { sold: -1 } },
        { $limit: 5 },
      ]),
      Order.aggregate([
    {
      $match: {
        status: 'completed',
        ...(dateFilter && { createdAt: dateFilter }),
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$finalAmount' },
      },
    },
  ]),
    ]);

    const totalRevenue = totalRevenueResult[0]?.total || 0;

    res.status(200).json({
      success: true,
      message: 'Tổng quan dashboard',
      data: {
        totalProducts,
        totalVariants,
        totalBlogs,
        totalUsers,
        totalCoupons,
        totalOrders,
        totalRevenue,
        topSellingProducts,
      },
    });
  } catch (error) {
    console.error('Lỗi dashboard overview:', error);
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};


export const getRevenueByFilter = async (req, res) => {
  try {
    const { fromDate, toDate } = getDateRange(req.query);
    const dateFilter = makeDateFilter(fromDate, toDate);

    const matchFilter = {
      status: 'completed',
      ...(dateFilter && { createdAt: dateFilter }),
    };

    const revenues = await Order.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: { $dateToString: { format: '%d/%m', date: '$createdAt' } },
          revenue: { $sum: '$finalAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      message: fromDate && toDate
        ? `Doanh thu từ ${fromDate.toLocaleDateString()} đến ${toDate.toLocaleDateString()}`
        : 'Doanh thu tổng',
      data: revenues,
    });
  } catch (error) {
    console.error('Lỗi getRevenueByFilter:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};



export const getTopSellingProducts = async (req, res) => {
  try {
    const { limit = 12 } = req.query;
    const { fromDate, toDate } = getDateRange(req.query);
    const dateFilter = makeDateFilter(fromDate, toDate);

    const matchFilter = {
      status: 'completed',
      ...(dateFilter && { createdAt: dateFilter }),
    };

    const result = await Order.aggregate([
      { $match: matchFilter },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          sold: { $sum: '$items.quantity' },
          price: { $first: '$items.price' },
          name: { $first: '$items.productName' },
        },
      },
      {
        $addFields: {
          productObjectId: {
            $cond: [
              { $eq: [{ $type: '$_id' }, 'objectId'] },
              '$_id',
              { $toObjectId: '$_id' },
            ],
          },
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: 'productObjectId',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      // ✅ Bỏ qua sản phẩm đã xóa vĩnh viễn (không còn trong products)
      {
        $match: {
          productInfo: { $ne: [] },
        },
      },
      { $unwind: '$productInfo' },
      {
        $project: {
          name: 1,
          sold: 1,
          price: 1,
          totalRevenue: { $multiply: ['$sold', '$price'] },
          image: {
            $ifNull: [
              { $arrayElemAt: ['$productInfo.images', 0] },
              '$productInfo.thumbnail',
            ],
          },
        },
      },
      { $sort: { sold: -1 } },
      { $limit: Number(limit) },
    ]);

    res.status(200).json({
      success: true,
      message: fromDate && toDate
        ? `Top ${limit} sản phẩm bán chạy từ ${fromDate.toLocaleDateString()} đến ${toDate.toLocaleDateString()}`
        : `Top ${limit} sản phẩm bán chạy tổng cộng`,
      data: result,
    });
  } catch (error) {
    console.error('Lỗi getTopSellingProducts:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

