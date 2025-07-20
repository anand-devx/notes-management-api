import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudinary.js";
import {Note} from '../models/note.model.js'
import mongoose from "mongoose";
import { title } from "process";

//functions
const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken
        user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}
    } catch (error) {
        
        throw new ApiError(500, error?.message || "Something went wrong")
    }
}

//controllers
const registerUser = asyncHandler(async function(req,res){
    // await Note.deleteMany({})
    // await User.deleteMany({})

    const {fullName,email,username,password} = req.body
    

    if ([fullName,email,username,password].some( (field) => field?.trim() === "" )){
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username } , { email }]
    })
    if(existedUser){
        throw new ApiError(409, "Email Id or Username already used, try another or login!")
    }
    const avatarLocalPath = req.files?.avatar?.[0]?.path
    let avatar;
    if(avatarLocalPath?.trim()){
        avatar = await uploadToCloudinary(avatarLocalPath)
        if(!avatar){
            throw new ApiError(400, "Avatar could not be uploaded, Check the file.")
        }
    }    
    const user = await User.create({
        fullName,
        email,
        username:username.toLowerCase(),
        password,
        avatar:avatar?.secure_url || "",
        avatarID:avatar?.public_id || ""
    })
    
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser) throw new ApiError(500, "Something went wrong while registering the user");
    
    // const deleteUser = async function(userId){
    //     if(User.findById(userId)){
    //         const deleteResponse = await User.findByIdAndDelete(userId)
    //     }
    //     else{
    //         throw new ApiError(400, "User not found!")
    //     }
    // }
    // deleteUser(user._id)

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)
    
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json (
        new ApiResponse(200,
            {
                
                accessToken, 
                refreshToken,
                user : loggedInUser,
                accessTokenExpiry:process.env.ACCESS_TOKEN_EXPIRY,
                refreshTokenExpiry:process.env.REFRESH_TOKEN_EXPIRY
            },
            "User Registered and Logged In Successfully")
    )
})

const loginUser = asyncHandler(async (req, res) => {
    const {email, username, password} = req.body
    console.log(email,username);
    if(!username?.trim() && !email?.trim()){
        throw new ApiError(400, "One of username and email is required")
    }

    const user = await User.findOne({
        $or:[{email},{username}]
    })
    if(!user){
        throw new ApiError(400, "User not found")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401,"Wrong Password")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)
    
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json (
        new ApiResponse(200,
            {
                user : loggedInUser, 
                accessToken, 
                refreshToken,
                accessTokenExpiry:process.env.ACCESS_TOKEN_EXPIRY,
                refreshTokenExpiry:process.env.REFRESH_TOKEN_EXPIRY
            },
            "User Logged In Successfully")
    )


})

const logoutUser = asyncHandler(async(req,res) => {
    
    const user = await User.findByIdAndUpdate(req.user._id,
        {
            $set : {
                refreshToken : null
            }
        },
        {
            new: true
        }
    ).select("-password")

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, user, "User Logged Out")
    )
})

const refreshTokens = asyncHandler(async(req,res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken) {
        throw new ApiError(400, "Unauthorised Request")
    }

    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    const user = await User.findById(decodedToken._id)
    if(!user){
        throw new ApiError(400, "Invalid Refresh Token")
    }
    
    if(user.refreshToken !== incomingRefreshToken){
        throw new ApiError(400, "Refresh Token is expired or used")
    }
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)
    const options = {
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                accessToken,
                refreshToken,
                accessTokenExpiry:process.env.ACCESS_TOKEN_EXPIRY,
                refreshTokenExpiry:process.env.REFRESH_TOKEN_EXPIRY
            },
            "Access Token and Refresh Token, refreshed successfully"
        )
    )
})

const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body
    if(!oldPassword || !newPassword){
        throw new ApiError(400, "All fields required")
    }
    const user = await User.findById(req.user._id)
    if(!user){
        throw new ApiError(400, "Invalid Request")
    }
    if(!user.isPasswordCorrect(oldPassword)){
        throw new ApiError(400, "Wrong Old Password")
    }
    user.password = newPassword
    user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed"))

})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullName, email} = req.body
    let updatedFields = {}
    const avatarLocalPath = req.files?.avatar?.[0]?.path
    var avatar;
    if(avatarLocalPath){
        avatar = await uploadToCloudinary(avatarLocalPath)
        if(!avatar){
            throw new ApiError(400, "Avatar Could not be uploaded, Check File!")
        }
        else {
            const user = await User.findById(req.user._id)
            const deleteResponse = await deleteFromCloudinary(user.avatarID)
            console.log(deleteResponse);
            updatedFields.avatar = avatar?.secure_url
            updatedFields.avatarID = avatar?.public_id
        }
    }
    if(!fullName?.trim() && !email?.trim() && !avatar) {
        throw new ApiError(400, "One of the fields is required")
    }
    
    if(fullName?.trim()) updatedFields.fullName = fullName
    if(email?.trim()){
        const existedEmail = await User.findOne({email})
        if(existedEmail){
        throw new ApiError(400, "Email Already Registered, Try another Email or leave blank!")
        }
        else updatedFields.email = email
    }
   

    const user = await User.findByIdAndUpdate(req.user._id,
    {
        $set:updatedFields
    },
    {
        new:true
    }).select("-password -refreshToken")
    return res
    .status(200)
    .json(new ApiResponse(200, user, "Details changed Successfully"))
})

const getNotes = asyncHandler(async(req, res) => {
    const user = req.user
    

    if(!user){
        throw new ApiError(400, "Unauthorised Request, Please login!")
    }

    const notes = await Note.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(user._id)
            }
        },
        {
            $lookup:{
                from:"user",
                localField:"owner",
                foreignField:"_id",
                as:"allNotes",
            }
        },
        {
            $project:{
                title:1,
                content:1,
                tags:1,
                coverImage:1,
                about:1,
                isPinned:1,
                owner:1
            }
        }
    ])
    if(!notes){
        throw new ApiError(404, "No Notes found!")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,
            notes,
            "Notes fetched Successfully"
        )
    )

})



export {
    registerUser,
    loginUser,
    logoutUser,
    refreshTokens,
    changeCurrentPassword,
    updateAccountDetails,
    getNotes
}