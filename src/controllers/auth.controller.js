import User from '../models/user.model.js';
import apiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import apiError from '../utils/apiError.js';
import {sendEmail} from '../utils/mail.js';
import { emailVerificationMailgenContent } from '../utils/mail.js';
const generateAccessTokenAndRefreshToken = async (userId)=>{
    try {
        const user=await User.findById(userId);
        const accessToken=user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();
        user.refreshToken=refreshToken;
        await user.save({
            validateBeforeSave:false
        });
        return {accessToken, refreshToken};
    } catch (error) {
        throw new apiError(500, "Something went wrong while generating tokens");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password ,role} = req.body;

    const existingUser = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (existingUser) {
        throw new apiError(409, "User already exists",[]);
    }

    const user = await User.create({ username, email, password , isEmailVerified:false });

    const { unHashesdToken, hashedToken, tokenExpiry } =user.generateTemperoryToken();


    user.emailVerificationToken=hashedToken;
    user.emailVerificationExpiry=tokenExpiry;
    await user.save({ validateBeforeSave: false });

    await sendEmail({
        email: user?.email,
        subject: "Please verify your email",
        mailgenContent: emailVerificationMailgenContent(user.username,
            `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashesdToken}`
        )
    });

   const createdUser= await User.findById(user._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry ");

    if(!createdUser){
        throw new apiError(500, "Something went wrong while creating user");
    }

   return res
     .status(201)
     .json(
       new apiResponse(
         200,
         { user: createdUser },
         "User registered successfully. Please check your email to verify your account.",
       ),
     );

})

export{registerUser}