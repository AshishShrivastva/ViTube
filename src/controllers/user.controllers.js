import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

//generating access and refresh tokens
const generateAccessAndRefreshToken = async(userId) => {
try {
        const user = await User.findById(userId)
    
        if(!user){
            throw new ApiError(404, "User not found!")
        }
    
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
    
        user.refreshToken = refreshToken
    
        await user.save({validateBeforeSave: false})
    
        return {accessToken, refreshToken}
    } 
catch (error) {
    throw new ApiError(500, "Something went wrong while generating the access and refresh tokens!")
}
}

//registering a user
const registerUser = asyncHandler(async (req,res) => {
    const {fullname, email, username, password} = req.body

    if(
        [fullname, email, username, password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{username},{email}]
    })

    if(existedUser){
        throw new ApiError(409, "User with username or email already exists in database")
    }

    console.warn(req.files)
    const avatarLocalPath = req.files?.avatar?.[0]?.path
    const coverLocalPath = req.files?.coverImage?.[0]?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is missing!")
    }

    // const avatar = await uploadOnCloudinary(avatarLocalPath)

    // let coverImage = ""
    // if(coverLocalPath){
    //     coverImage = await uploadOnCloudinary(coverLocalPath)
    // }

    let avatar;
    try{
        avatar = await uploadOnCloudinary(avatarLocalPath)
        console.log("Uploaded avatar", avatar)
    }
    catch(error){
        console.log("Error uploading avatar...", error)
        throw new ApiError(500, "Failed to upload avatar!")
    }

    let coverImage;
    try{
        coverImage = await uploadOnCloudinary(coverLocalPath)
        console.log("Uploaded cover image", coverImage)
    }
    catch(error){
        console.log("Error uploading cover image...", error)
        throw new ApiError(500, "Failed to upload cover image!")
    }

    try {
        const user = await User.create({
            fullname,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase()
        })
    
        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )
    
        if(!createdUser){
            throw new ApiError(500, "Something went wrong while registering the user...")
        }
    
        return res
            .status(201)
            .json(new ApiResponse(201, createdUser, "User registered successfully!"))
    } catch (error) {
        console.log("User creation failed!", error)

        if(avatar){
            await deleteFromCloudinary(avatar.public_id)  //avatar.resource_type || "image"
        }

        if(coverImage){
            await deleteFromCloudinary(coverImage.public_id)
        }

        throw new ApiError(500, "Something went wrong while registering the user and images were deleted")
    }
})

//user login
const loginUser = asyncHandler(async (req, res) => {
    //get data from body
    const {email, username, password} = req.body

    //validation
    if(!email){
        throw new ApiError(404, "Email is required!")
    }

    //finds/retrives user from DB
    const user = await User.findOne({
        $or: [{username},{email}]
    })

    if(!user){
        throw new ApiError(404, "User not found!")
    }

    //validate password
    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid credentials!")
    }

    //
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    if(!loggedInUser){
        throw new ApiError(401, "Failed to log in user!")
    }

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(
            200,
            {user: loggedInUser, accessToken, refreshToken},
            "User Logged In Successfully..."
        ))
})

const logoutUser = asyncHandler(async (req, res) => {
    //TODO
    await User.findByIdAndUpdate()
})

//refreshing the access tokens
const refreshAccessToken = asyncHandler( async(req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "Refresh Token is required!")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if(!user){
            throw new ApiError(401, "Invalid refresh token!")
        }

        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Invalid refresh token!")
        }

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        }

        const {accessToken, refreshToken: newRefreshToken} = await generateAccessAndRefreshToken(user._id)

        return res
            .status(200)
            .cookies("accessToken", accessToken, options)
            .cookies("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken,
                        refreshToken: newRefreshToken
                    },
                    "access Token refreshed successfully"
                )
            )
    } catch (error) {
        throw new ApiError(500, "Something went wrong while refreshng the access token!")
    }
})

export { 
    registerUser,
    loginUser,
    refreshAccessToken
 }