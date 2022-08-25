import User from "../models/User.js";
import sendToken from "../utils/jwtToken.js";
import crypto from "crypto-js";
import sendMail from "../utils/sendMail.js";
import cloudinary from "cloudinary";
import { signUpValidation, signInValidation } from "../utils/validation.js";


// Register User
export const signUp = async (req, res, next) => {
    try {
        const { error } = signUpValidation(req.body);
        if (error) {
            return res.status(404).json(error.details[0].message);
        }

        const { username, email, mobile, password, avatar } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(404).json("User already exit!");
        }

        const myCloud = await cloudinary.v2.uploader.upload(avatar, {
            folder: "avatars",
            width: 150,
            crop: "scale"
        })


        user = await new User({
            username,
            email,
            mobile,
            password,
            avatar: { public_id: myCloud.public_id, url: myCloud.secure_url },
        });

        await user.save()
        // const token = user.getJwtToken();
        await sendToken(user, 200, res);

        /*return res.status(200).json({
            success: true,
            token,
            user
        })*/

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// signIn User

export const signIn = async (req, res, next) => {
    try {
        /*const { error } = signInValidation(req.body)
        if(error) {
            return res.status(404).json(error.details[0].message)
        }*/

        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(404).json("Please enter the email & password")
        }

        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(404).json("User is not find with this email & password")
        }

        const isPasswordMatched = await user.comparePassword(password);
        if (!isPasswordMatched) {
            return res.status(404).json("User is not find with this email & password")
        }

        /*const token = user.getJwtToken();

        return res.status(200).json({
            success: true,
            token,
            message: "User Logged In Successfully..."
        })*/
        // const { password, ...others } = user._doc
        await sendToken(user, 200, res);



    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


// Update User


// logout User
export const logout = async (req, res, next) => {
    try {

        res.cookie("token", null, {
            expires: new Date(Date.now()),
            httpOnly: true,
        });

        return res.status(200).json({
            success: true,
            message: "Log out success",
        });



    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

//Forgot password
export const forgotPassword = async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(404).json("User is not find with this email & password")
    }

    // Get ResetPassword Token

    const resetToken = user.getResetToken();
    await user.save({
        validateBeforeSave: false,
    })

    const resetPasswordUrl = `${req.protocol}://${req.get(
        "host"
    )}/api/v2/users/password/reset/${resetToken}`;

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl}`;

    try {


        await sendMail({
            email: user.email,
            subject: `Ecommerce Password Recovery`,
            message,
        });

        return res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} succesfully`,
        });


    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordTime = undefined;

        await user.save({
            validateBeforeSave: false,
        });

        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


// reset password
export const resetPassword = async (req, res, next) => {
    try {
        const resetPasswordToken = crypto.SHA256(req.params.token).toString(crypto.enc.Hex);

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordTime: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(404).json("Reset password url is invalid or has been expired");
        }

        if (req.body.password !== req.body.confirmPassword) {
            return res.status(404).json("Password is not matched with the new password")
        }

        user.password = req.body.password;

        user.resetPasswordToken = undefined;
        user.resetPasswordTime = undefined;

        await user.save();

        await sendToken(user, 200, res);

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// get user details
export const userDetails = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "You are not authenticated!"
            });
        }

        return res.status(200).json({
            success: true,
            user
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


// upadte Password
export const updatePassword = async (req, res, next) => {
    try {

        const user = await User.findById(req.user.id).select("+password");

        const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

        if (!isPasswordMatched) {
            return res.status(404).json({
                success: false,
                message: "Old Password is incorrect"
            });

        };

        if (req.body.newPassword !== req.body.confirmPassword) {
            return res.status(404).json({
                success: false,
                message: "Password not matched with each other"
            });
        }

        user.password = req.body.newPassword;

        await user.save();

        await sendToken(user, 200, res);



    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}



//upadte user profile
export const updateProfile = async (req, res, next) => {
    try {

        const newUserData = {
            username: req.body.username,
            email: req.body.email,
        };


        if (req.body.avatar !== "") {
            const user = await User.findById(req.user.id);

            const imageId = user.avatar.public_id;

            await cloudinary.v2.uploader.destroy(imageId);

            const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
                folder: "avatars",
                width: 150,
                crop: "scale",
            });
            newUserData.avatar = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }

        const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
            new: true,
            runValidator: true,
            useFindAndModify: false,
        });

        return res.status(200).json({
            success: true,
            message: "User Updated Successfully...",
            user
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


// Get All users ---Admin

export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find();

        return res.status(200).json({
            success: true,
            users,
        });
    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message
        })
    }
}

// Get Single User Details ---Admin
export const getSingleUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json("User is not find with this id")
        }

        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


// Change user Role --Admin
export const updateUserRole = async (req, res, next) => {
    try {
        const newUserData = {
            username: req.body.username,
            email: req.body.email,
            role: req.body.role,
        };

        const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        });

        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message
        })
    }
}

// Delete User ---Admin
export const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        const imageId = user.avatar.public_id;

        await cloudinary.v2.uploader.destroy(imageId);

        if (!user) {
            return res.status(404).json("User is not find with this id")
        }

        await user.remove();

        return res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}