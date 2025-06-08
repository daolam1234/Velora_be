// import { de } from "@faker-js/faker";
import mongoose from "mongoose";


const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true
		},
		full_name: {
			type: String,
			required: true,
		},
		phone: {
			type: String,
			required: true,
		},
		address: {
			type: String,
			required: true,
		},
		role: {
			type: String,
			enum: ['customer', 'admin'],
			default: 'customer',

		},
	},
	{ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, versionKey: false }
);

const User = mongoose.model("User", userSchema);

export default User;
