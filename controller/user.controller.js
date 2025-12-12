import User from "../model/User.model.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const registerUser = async (req, res) => {
    // get data
    //validate
    // check if user already exists
    // create a user in database
    //create a verification token
    // save token in database
    // send token as email to user
    // send success status to user

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({
            message: "All fields are required",
        });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists",
            });
        }
        
        const user = await User.create({
            name,
            email,
            password,
        });
        console.log(user);

        if (!user) {
            return res.status(400).json({
                message: "User not registered",
            });
        }

        const token = crypto.randomBytes(32).toString("hex");
        console.log(token);
        user.verficationToken = token;

        await user.save();

        //send email
        const transporter = nodemailer.createTransport({
            host: process.env.MAILTRAP_HOST,
            port: process.env.MAILTRAP_PORT,
            secure: false, // true for port 465, false for other ports
            auth: {
                user: process.env.MAILTRAP_USERNAME,
                pass: process.env.MAILTRAP_PASSWORD,
            },
        });

        const mailOption = {
            from: process.env.MAILTRAP_SENDEREMAIL,
            to: user.email,
            subject: "Verify your email", // Subject line
            text: `Please click on the following link:
      ${process.env.BASE_URL}/api/v1/users/verify/${token}
      `,
        };

        await transporter.sendMail(mailOption);

        res.status(201).json({
            message: "User registered successfully",
            success: true,
        });
    } catch (error) {
        res.status(400).json({
            message: "User not registered ",
            error,
            success: false,
        });
    }
};

const verifyUser = async (req, res) => {
    //get token from url
    //validate
    // find user based on token
    //if not
    // set isVerified field to true
    // remove verification token
    // save
    //return response

    const { token } = req.params;
    console.log(token);
    if (!token) {
        return res.status(400).json({
            message: "Invalid token",
        });
    }
    const user = await User.findOne({ verficationToken: token });

    if (!user) {
        return res.status(400).json({
            message: "Invalid token",
        });
    }
    user.isVerified = true;
    user.verficationToken = undefined;
    await user.save();
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "All fields are required",
        });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        console.log(isMatch);

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid email or password",
            });
        }

        //

        const token = jwt.sign(
            { id: user._id, role: user.roles },

            process.env.JWT_SECRET,
            {
                expiresIn: "24h",
            }
        );
        const cookieOptions = {
            httpOnly: true,
            secure: true,
            maxAge: 24 * 60 * 60 * 1000,
        };
        res.cookie("token", token, cookieOptions);

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                role: user.roles,
            },
        });
    } catch (error) { }
};


const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password')
        if(!user){
            return res.status(400).json({
                message:"User not found"
            })
        }

        res.status(201).json({
            success:true,
            user
        })
        

    } catch (error) {

    }
}

const logoutUser = async (req, res) => {
    try {
        res.cookie('token','',{});
        res.status(200).json({
            success:true,
            message:"Logged out successfully",
        });

    } catch (error) {

    }
}

const forgotPassword = async (req, res) => {
    try {
        //getemail
        const user = await User.findOne({email})
        //find user base in email
        //reset token + reset expire => Date.now() =>user.save()
        //send mail =>design url
        //

    } catch (error) {

    }
}

const resetPassword = async (req, res) => {
    try {
        //collect token from params
        // password from res.body
        const {token} = req.params
        const {password, confpassword} =req.body
        if (password === confpassword){

        }
        
        try {
            await User.findOne({
                resetPasswordToken: token,
                resetPasswordExpiry: {$gt: Date.now()}
            })
            // set password in user
            // resetToken,resetExpiry => reset
            // save
        } catch (error) {
            
        }
    } catch (error) {

    }
}

export { registerUser, verifyUser, login, getMe, logoutUser, resetPassword, forgotPassword };