import mongoose, { Schema } from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new Schema(
{
    username: {
        type: String,
        lowercase: true,
        index: true,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    fullname: {
        type: String,
        trim: true,
        required: true,
        index: true
    },
    avatar: {
        type: String, //Cloudinary URl
        required: true
    },
    coverImage: {
        type: String, //Cloudinary URl
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String,
        required: [true, "Password is required!"]
    },
    refreshToken: {
        type: String
    }
},
{timestamps: true}                      //mongoose provides date fields automatically
)

userSchema.pre("save", async function(next){                                //pre hook at the time of saving
    if(!this.isModified("password")) return next()

    this.password = await bcrypt.hash(this.password, 10)

    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    //short lived access token
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullname: this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
    {expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
)
}

userSchema.methods.generateRefreshToken = function(){
    //long lived refresh token
    return jwt.sign({
        _id: this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
)
}

export const User = mongoose.model("User", userSchema)