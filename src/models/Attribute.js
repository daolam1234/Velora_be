import mongoose from "mongoose";

const attributeSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["size", "color"], 
    required: true
  },
 
  value: {
    type: String,
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, 
  versionKey: false 
});

const Attribute = mongoose.model("Attribute", attributeSchema);

export default Attribute;
