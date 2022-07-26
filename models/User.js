import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto-js";
import { nanoid } from "nanoid";
// import { uuid } from "uuidv4";


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Please your Name"],
        minlength: [3, "Please enter a name atleast 3 characters"],
        maxlength: [15, "Name can not big than 15 characters"],
    },

    mobile: {
        type: String,
        required: [true, "Please enter your mobile number"],
        minlength: [10, "Please enter a number atleast 10 number"],
        maxlength: [15, "Mobile number can not excedd gretater than 15"],
    },

    email: {
        type: String,
        required: [true, "Please enter your email"],
        //validate: ["Please enter a valid email"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Please enter your password!"],
        minlength: [8, "Password should be greater than 8 characters"],
        select: false,
    },

    avatar: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
    },

    role: {
        type: String,
        default: "user",
    },

    createdAt: {
        type: Date,
        default: Date.now(),
    },

    resetPasswordToken: String,
    resetPasswordTime: Date,
}, { timestamp: true });

// Hash password
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});

// jwt token
userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES,
    });
};

// compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Forgot password
userSchema.methods.getResetToken = function () {
    // Generating token
   // const resetToken = crypto.randomBytes(20).toString('hex');
    const resetToken = nanoid(64)

    //    hashing and adding resetPasswordToken to userSchema
    this.resetPasswordToken = crypto.SHA256(resetToken).toString(crypto.enc.Hex);

    this.resetPasswordTime = Date.now() + 15 * 60 * 1000;

    return resetToken;
};




const model = mongoose.model("User", userSchema);

export default model;
