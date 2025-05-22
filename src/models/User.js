import { de } from "@faker-js/faker";
import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
	city: {
		type: String,
		required: true,
	},
	district: {
		type: String,
		required: true,
	},
	detail: {
		type: String,
		required: true,
	},
	default: {
		type: Boolean,
		default: false,
	},
});

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
		role_id: {
			type: String,
			// required: true,
			default: 'user',
		},
	},
	{ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, versionKey: false }
);

const User = mongoose.model("User", userSchema);

export default User;
