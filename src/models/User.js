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
		fullname: {
			type: String,
			required: true,
		},
		email: {},
		password: {},
		phoneNumber: {},
		address: [
			{
				type: addressSchema,
				required: true,
			},
		],
	},

	{ timestamps: true, versionKey: false }
);

const User = mongoose.model("User", userSchema);

export default User;
