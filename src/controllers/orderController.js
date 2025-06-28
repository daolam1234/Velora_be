import { log } from "console";
import Order from "../models/Order.js";
import { cancelOrderService, createOrderService, getOrderByIdService, getOrdersByUserService, getOrdersService, updateOrderStatusService } from "../service/order.service.js";
import { createdHandler } from "../utils/createdHandler.js";
import qs from "querystring"
import crypto from 'crypto';
import moment from 'moment';

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


