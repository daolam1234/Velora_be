import { log } from "console";
import Order from "../models/Order.js";
import { cancelOrderService, createOrderService, getOrderByIdService, getOrdersByUserService, getOrdersService, updateOrderStatusService } from "../service/order.service.js";
import { createdHandler } from "../utils/createdHandler.js";
import qs from "querystring"
import crypto from 'crypto';
import moment from 'moment';
import { sendMail } from "../service/mail.service.js";
import { translateStatus } from "../utils/statusOrder.js";

export const createOrder = async (req, res) => {
  const result = await createOrderService(req);

  if (result.success) {
    return res.status(result.statusCode).json(createdHandler(result.data, result.message));
  }

  return res.status(result.statusCode).json({
    success: false,
    message: result.message,
  });
};



export const getOrdersByUser = async (req, res) => {
  try {
    const result = await getOrdersByUserService(req.user._id);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error getting orders:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getOrders = async (req, res) => {
  try {
    const result = await getOrdersService();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error getting orders:", error);
    res.status(500).json({ message: "Server error" });
  }
};



export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getOrderByIdService(id, req.user);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error getting order by ID:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};



export const updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const result = await updateOrderStatusService(orderId, status);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};



export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const result = await cancelOrderService(orderId, userId);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error cancelling order:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};


export const paymentVNPay = async (req,res) =>{
  function sortObject(obj){
  let sorted = {};
   let keys = Object.keys(obj).sort();
   keys.forEach((key) => {
      sorted[key] = obj[key];
   });
   return sorted;
  }
 
   const { amount } = req.query;
   const tmnCode = "KPY8YI6I" //Lấy trừ VNPay
   const secretKey = "HV3HQ5HDKZO0CDJZ9CMB2S0483POTEQE" ;
   
   const returnUrl = "http://localhost:5173/payment-result";
   const vnp_Url = "http://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

   let ipAddr = req.ip;
   let orderId = moment().format("YYYYMMDDHHmmss");
   let bankCode = req.query.bankCode || "";

   let createDate = moment().format("YYYYMMDDHHmmss");
   let orderInfo = "Thanh_toan_don_hang";
   let locale = req.query.language || "vn";
   let currCode = "VND";

    let vnp_Params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: tmnCode,
      vnp_Locale: locale,
      vnp_CurrCode: currCode,
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: "billpayment",
      vnp_Amount: amount * 100, // nhân 100 theo yêu cầu VNPay
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };

    if (bankCode !== "") {
      vnp_Params["vnp_BankCode"] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);

    // Tạo chuỗi dữ liệu để ký
    let signData = qs.stringify(vnp_Params);
    let hmac = crypto.createHmac("sha512", secretKey);
     let signed = hmac.update(new Buffer.from(signData, "utf-8")).digest("hex");
  vnp_Params["vnp_SecureHash"] = signed;

  let paymentUrl = vnp_Url + "?" + qs.stringify(vnp_Params);

  res.json({ paymentUrl });
}

export const checkResultPaymentVNPay = async (req,res)=>{
   const query = req.query;
  const secretKey = "HV3HQ5HDKZO0CDJZ9CMB2S0483POTEQE";
  const vnp_SecureHash = query.vnp_SecureHash;

  delete query.vnp_SecureHash;
  const signData = qs.stringify(query);

  const hmac = crypto.createHmac("sha512", secretKey);
  const checkSum = hmac.update(signData).digest("hex");

  if (vnp_SecureHash === checkSum) {
    if (query.vnp_ResponseCode === "00") {
      res.json({ message: "Thanh toán thành công", data: query });
    } else {
      res.json({ message: "Thanh toán thất bại", data: query });
    }
  } else {
    res.status(400).json({ message: "Dữ liệu không hợp lệ" });
  }
}

//hàm xác nhận nhận đơn hàng cho người dùng 
export const confirmReceivedOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    // Tìm đơn hàng
    const order = await Order.findById(orderId).populate("user");
    if (!order) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    // Kiểm tra quyền sở hữu
if (order.user._id.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Bạn không có quyền với đơn hàng này" });
    }

    // Chỉ cho phép xác nhận khi đang ở trạng thái 'shipped'
    if (order.status !== "shipped") {
      return res.status(400).json({ success: false, message: "Chỉ có thể xác nhận đơn hàng đang giao" });
    }

    // Cập nhật trạng thái
    order.status = "completed";
    await order.save();


await sendMail({
  to: order.user.email,
  subject: `Xác nhận đã nhận hàng - ORDER-${order._id.toString().slice(-6).toUpperCase()}`,
  html: `
    <div style="font-family: Arial, sans-serif; color: #333; font-size: 15px; line-height: 1.6;">
      <h2 style="color: #2c3e50;">Xin chào <span style="color:#3498db">${order.user.username}</span>,</h2>
      <p>Bạn đã xác nhận <strong>đã nhận được đơn hàng</strong>. Cảm ơn bạn đã tin tưởng Velora!</p>

      <h3>🧾 Thông tin đơn hàng:</h3>
      <table cellpadding="5" cellspacing="0" style="border-collapse: collapse; margin: 10px 0;">
        <tr><td><strong>Mã đơn hàng:</strong></td><td style="color: #e74c3c;">ORDER-${order._id.toString().slice(-6).toUpperCase()}</td></tr>
        <tr><td><strong>Ngày xác nhận:</strong></td><td>${new Date().toLocaleString("vi-VN")}</td></tr>
        <tr><td><strong>Trạng thái mới:</strong></td><td><strong style="color: green;">${translateStatus(order.status)}</strong></td></tr>
      </table>

      <h3>👤 Thông tin người nhận:</h3>
      <p>
        <strong>Họ tên:</strong> ${order.shippingAddress?.name || "Không có"}<br/>
        <strong>SĐT:</strong> ${order.shippingAddress?.phone || "Không có"}<br/>
        <strong>Địa chỉ:</strong> ${order.shippingAddress?.addressLine || "Không có"}<br/>
        <strong>Hình thức thanh toán:</strong> ${
          order.paymentMethod === "cod"
            ? "Thanh toán khi nhận hàng"
            : order.paymentMethod === "vnpay"
            ? "VNPAY"
            : "Không xác định"
        }<br/>
        <strong>Ghi chú:</strong> ${order.note || "Không có ghi chú"}
      </p>

      <h3>📦 Sản phẩm đã đặt:</h3>
      <table cellpadding="8" cellspacing="0" border="1" style="border-collapse: collapse; width: 100%;">
        <thead style="background-color: #f2f2f2;">
          <tr>
            <th style="text-align: left;">Sản phẩm</th>
            <th>Phân loại</th>
            <th>Giá</th>
            <th>Số lượng</th>
            <th>Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${order.items
            .map(
              (item) => `
              <tr>
                <td>${item.productName}</td>
                <td>${item.variant.size || ""} ${
                  item.variant.color ? `- ${item.variant.color}` : ""
                }</td>
                <td>${item.price.toLocaleString("vi-VN")}₫</td>
                <td>${item.quantity}</td>
                <td>${(item.price * item.quantity).toLocaleString("vi-VN")}₫</td>
              </tr>`
            )
            .join("")}
        </tbody>
      </table>

      <h3>💰 Tổng cộng:</h3>
      <p>
        <strong>Tạm tính:</strong> ${order.totalAmount.toLocaleString("vi-VN")}₫ <br/>
        <strong>Phí vận chuyển:</strong> ${32000 .toLocaleString("vi-VN") || "0"}₫ <br/>
        <strong>Giảm giá:</strong> -${order.discountAmount.toLocaleString("vi-VN")}₫ <br/>
        <strong style="font-size: 17px;">Tổng thanh toán: <span style="color: #e67e22;">${order.finalAmount.toLocaleString("vi-VN")}₫</span></strong>
      </p>

      <p style="margin-top: 20px;">Nếu bạn có bất kỳ thắc mắc nào, hãy liên hệ với đội ngũ hỗ trợ của chúng tôi.</p>

      <hr style="margin: 20px 0;" />
      <p style="text-align: center; color: #999;">Velora Shop 👟<br/>Cảm ơn bạn đã tin tưởng!</p>
    </div>
  `,
});

    
    return res.status(200).json({
      success: true,
      message: "Đơn hàng đã được xác nhận là hoàn thành",
      data: order,
    });
  } catch (error) {
    console.error("Lỗi khi xác nhận đơn hàng:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};
