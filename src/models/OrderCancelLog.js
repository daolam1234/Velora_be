// models/OrderCancelLog.js
import mongoose from "mongoose";

const OrderCancelLogSchema = new mongoose.Schema({
  user: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  order: { type: mongoose.Types.ObjectId, ref: "Order", required: true },
  cancelledAt: { type: Date, default: Date.now },
});

const OrderCancelLog = mongoose.model("OrderCancelLog", OrderCancelLogSchema);

export default OrderCancelLog;