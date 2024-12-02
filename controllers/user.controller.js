import sendEmail from "../config/sendemail.js";
import UserModel from "../models/user.model.js";
import bcrypt from 'bcryptjs';
import verifyEmailTemplate from "../utils/verifyEmailTemplate.js";
import dotenv from 'dotenv';
import generateAccessToken from "../utils/generateAccessToken.js";
import generateRefreshToken from "../utils/generateRefreshToken.js";
import uploadImageCloudinary from "../utils/uploadImageCloudinary.js";
import generateOtp from "../utils/generateOtp.js";
import forgotPasswordTemplate from "../utils/forgotPasswordTemplate.js";
import jwt from 'jsonwebtoken';


dotenv.config();

// register
export async function registerUserController(req, res) {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Provide the credentials",
                erorr: true,
                success: false
            })
        }
        // 
        const user = await UserModel.findOne({ email });
        if (user) {
            return res.json({
                message: "email is already registred",
                success: false,
                error: true
            })
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const payload = {
            name,
            email,
            password: hashedPassword
        }
        const newUser = new UserModel(payload)
        const save = await newUser.save()
        // resend email
        const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?code=${save?._id}`
        console.log(process.env.FRONTEND_URL);

        // resend data url
        const verfiyEmail = await sendEmail({
            sendTo: email,
            subject: "Verify from Ecom",
            html: verifyEmailTemplate({
                name,
                url: verifyUrl
            })

        })

        return res.json({
            message: "User Registered Successfully",
            error: false,
            success: true,
            data: save
        })




    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })

    }

}

// verify
export async function verifyUserEmail(req, res) {
    try {
        const { code } = req.body;
        const user = await UserModel.findOne({ _id: code })
        if (!user) {
            return res.status(400).json({
                message: "Invalid code",
                error: true,
                success: false

            })
        }
        const updatedUser = await UserModel.updateOne({
            _id: code
        }, {
            verify_email: true
        })
        return res.jons({
            message: "Email Verification Done",
            success: true,
            error: false
        })

    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            error: true,
            success: false

        })

    }

}

// login

export async function loginUserController(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "Provide Credentials",
                error: true,
                success: true

            })
        }

        const user = await UserModel.findOne({ email })
        if (!user) {
            return res.status(400).json({
                message: "User Not Found",
                error: true,
                success: false
            })
        }
        if (user.status !== "Active") {
            return res.status(400).sjon({
                message: "Contact to Admin",
                error: true,
                success: false
            })
        }

        const comparePassword = await bcrypt.compare(password, user.password)
        if (!comparePassword) {
            return res.status(400).json({
                message: "Check the Password",
                error: true,
                success: false
            })

        }

        // cookie code 
        const accessToken = await generateAccessToken(user._id);
        const refreshToken = await generateRefreshToken(user._id);

        const cookieOption = {
            httpOnly: true,
            sameSite: "None",
            secure: true
        }
        res.cookie("accessToken", accessToken, cookieOption);
        res.cookie("refreshToken", refreshToken, cookieOption);
        return res.json({
            message: "User Login Successfull",
            error: false,
            success: true,
            data: {
                accessToken,
                refreshToken
            }
        })


    } catch (error) {
        return res.status(500), json({
            message: error.message || error,
            error: true,
            success: false
        })


    }


}

// logout 
export async function logoutUserController(req, res) {
    try {
        const userId = req.userId;
        const cookieOption = {
            httpOnly: true,
            sameSite: "None",
            secure: true
        }
        res.clearCookie("accessToken", cookieOption);
        res.clearCookie("refreshToken", cookieOption);
        const removeCookie = await UserModel.findByIdAndUpdate(userId, {
            refresh_token: ""
        })

        return res.json({
            message: "User Logout Successfully",
            error: false,
            success: true
        })


    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false

        })


    }
}

// avatar 
export async function uploadAvater(req, res) {

    try {
        const userId = req.userId;
        const image = req.file;
        const upload = await uploadImageCloudinary(image);
        const newUser = await UserModel.findByIdAndUpdate(userId, {
            avatar: upload.url
        })

        return res.json({
            message: "avatar uploaded",
            data: {
                _id: userId,
                avatar: upload.url
            }
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })

    }

}

// update user
export async function updateUserDetails(req, res) {
    try {
        const userId = req.userId;
        const { name, email, mobile, password } = req.body;
        let hashedPassword = "";
        if (password) {
            const salt = await bcrypt.genSalt(10)
            hashedPassword = await bcrypt.hash(password, salt)

        }
        const updateDetails = await UserModel.updateOne({ _id: userId }, {
            ...(name && { name: name }),
            ...(email && { email: email }),
            ...(mobile && { mobile: mobile }),
            ...(password && { password: hashedPassword })


        })


        return res.json({
            message: "User Updated Successfully",
            error: false,
            success: true,
            data: updateDetails
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            success: false,
            error: true
        })

    }

}

// forgot password

export async function forgotPasswordController(req, res) {
    try {
        const { email } = req.body;
        const user = await UserModel.findOne({ email })
        if (!user) {
            return res.status(400).json({
                message: "email not found",
                error: true,
                success: false
            })
        }
        const otp = await generateOtp();
        const expireTime = new Date();
        const exactTime = new Date(expireTime.getTime() + 60 * 60 * 1000)


        const update = await UserModel.findByIdAndUpdate(user._id, {
            forgot_password_otp: otp,
            forgot_password_expiry: new Date(exactTime).toISOString()

        })
        await sendEmail({
            sendTo: email,
            subject: "forgot password from ecom",
            html: forgotPasswordTemplate({
                name: user.name,
                otp: otp
            })
        })
        return res.json({
            message: "check your mail",
            erorr: false,
            success: true


        })



    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })

    }

}


// verify forgot password otp

export async function verifyForgotPasswordController(req, res) {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: "Provide the required fields",
                error: true,
                success: false
            })
        }

        const user = await UserModel.findOne({ email })
        if (!user) {
            return res.status(400).json({
                message: "Email not found",
                error: true,
                success: false
            })
        }
        const currentTime = new Date();

        if (user.forgot_password_expiry < currentTime) {
            return res.status(400).json({
                message: "Otp is expired",
                error: true,
                success: false
            })
        }

        if (otp !== user.forgot_password_otp) {
            return res.status(400).json({
                message: "Invalid otp",
                success: false,
                error: true
            })
        }
        return res.json({
            message: "Otp verified Successfully",
            error: false,
            success: true
        })



    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })

    }
}


// reset the password

export async function resetPasswordController(req, res) {
    try {
        const { email, newPassword, confirmPassword } = req.body;
        if (!email || !newPassword || !confirmPassword) {
            return res.status(400).json({
                message: "Provide the fields",
                success: false,
                error: true
            })
        }
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Email not found",
                error: true,
                success: false

            })
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: "Password do not match",
                success: false,
                error: true
            })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        const update = await UserModel.findOneAndUpdate(user._id, {
            password: hashedPassword
        });
        return res.json({
            message: "Password reset successfully",
            error: false,
            success: true
        })




    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })

    }

}

// refresh token
export async function refreshToken(req, res) {
    try {
        const refreshToken = req.cookies.refreshToken || req?.headers?.authorization?.split(" ")[1];
        if (!refreshToken) {
            return res.status(400).json({
                message: "Invalid token",
                error: true,
                success: false
            })
        }
        const verifyToken = await jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY);
        if (!verifyToken) {
            return res.status(400).json({
                message: "Token expired",
                error: true,
                success: false
            })
        }
        const cookieOption = {
            httpOnly: true,
            sameSite: "None",
            secure: true
        }
        const userId = verifyToken._id
        const newAccessToken = await generateAccessToken(userId);
        res.cookie("accessToken", newAccessToken, cookieOption);
        return res.json({
            message: "token refreshed",
            error: false,
            success: true,

            data: {
                accessToken: newAccessToken
            }

        })





    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false,

        })

    }
}

