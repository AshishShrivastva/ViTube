import mongoose, { Schema } from "mongoose"

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

export const User = mongoose.model("User", userSchema)