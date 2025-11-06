import User from '../models/user.model.js';
import apiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import apiError from '../utils/apiError.js';
import {sendEmail} from '../utils/mail.js';
import { emailVerificationMailgenContent } from '../utils/mail.js';
import jwt from 'jsonwebtoken';
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

const login = asyncHandler(async (req,res)=>{
    const {email,password,username}=req.body

    if(!email || !username){
        throw new apiError(400,"Email or Username is required to login",[])
    }

    const user = await User.findOne({email});

    if(!user){
        throw new apiError(400,"User does not exist",[])
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if(!isPasswordCorrect){
        throw new apiError(400,"Password is incorrect",[])
    }

    const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id);

     const loggedInUser = await User.findById(user._id).select(
       "-password -refreshToken -emailVerificationToken -emailVerificationExpiry ",
     );

     if (!loggedInUser) {
       throw new apiError(500, "Something went wrong while logging in user");
     }

     const options = {
         httpOnly: true,
         secure:true,

     }

     return res
       .status(200)
       .cookie("accesToken", accessToken, options)
       .cookie("refreshToken", refreshToken, options)
       .json(
         new apiResponse(200, { user: loggedInUser , accessToken, refreshToken }, "User logged in successfully."),
       );
    
})

const logoutUser = asyncHandler(async (req,res)=>{
     await User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                refreshToken:""
            }
        },

        {
            new:true
        }
     );
        const options = {
            httpOnly: true,
            secure:true,

        }

        return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options)
        .json(
            new apiResponse(200, {}, "User logged out successfully.")
        );
})

const getCurrentUser = asyncHandler(async (req,res)=>{
    return res.status(200).json(
        new apiResponse(200, {user:req.user}, "Current user fetched successfully.")
    )
})

const verifyEmail = asyncHandler( async (req,res)=>{
    const {verificationToken} = req.params;
    if(!verificationToken){
        throw new apiError(400,"Verification token is required",[])
    }

    const hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: Date.now() },
  })

    if(!user){
        throw new apiError(400,"Invalid or expired verification token",[])
    }

    user.isEmailVerified=true;
    user.emailVerificationToken=undefined;
    user.emailVerificationExpiry=undefined;

    await user.save({validateBeforeSave:false});

    return res.status(200).json(
        new apiResponse(200, {isEmailVerified:true}, "Email verified successfully.")
    )
});

const resendEmailVerification = asyncHandler(async (req,res)=>{
    const user = await User.findById(req.user._id);
    if(!user){
        throw new apiError(404,"User not found",[])
    }

    if(user.isEmailVerified){
        throw new apiError(409,"Email is already verified",[]);
    }
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
    })
    return res.status(200).json(
        new apiResponse(200, {}, "Email verification link sent successfully.")
    )
})

const refreshAccessToken = asyncHandler(async (req, res) =>{
   const incommingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

   if(!incommingRefreshToken){
       throw new apiError(401,"Unauthorised request");
   }

   try {
    const decodedToken = jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id);
    if(!user){
        throw new apiError(401,"Unauthorised request");
    }
    if(user.refreshToken !== incommingRefreshToken){
        throw new apiError(401,"Unauthorised request");
    }

    const options={
        httpOnly:true,
        secure:true,

    }

    const {accessToken, refreshToken: newRefreshToken} = await generateAccessTokenAndRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    return res.status(200).cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
        new apiResponse(200, {accessToken, refreshToken:newRefreshToken}, "Access token refreshed successfully.")
    );
   } catch (error) {
         throw new apiError(401,"Unauthorised request");
   }
})

export { registerUser, login, logoutUser, getCurrentUser, verifyEmail, resendEmailVerification, refreshAccessToken };