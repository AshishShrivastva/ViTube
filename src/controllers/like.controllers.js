import mongoose, { isValidObjectId } from "mongoose"
import {Like} from "../models/like.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

// Toggle like on a video
const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    // 1. USE ApiError: Validate the ID format
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const existingLike = await Like.findOne({ video: videoId, likedBy: req.user?._id })

    if (existingLike) {
        await existingLike.deleteOne()
        return res
            .status(200)
            .json(new ApiResponse(200, null, "Unliked"))
    }

    const like = await Like.create({ video: videoId, likedBy: req.user?._id })

    return res
        .status(201)
        .json(new ApiResponse(201, like, "Liked"))
})

// Toggle like on a comment
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    // 1. USE ApiError: Validate the ID format
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }

    const existingLike = await Like.findOne({ comment: commentId, likedBy: req.user?._id })

    if (existingLike) {
        await existingLike.deleteOne()
        return res
            .status(200)
            .json(new ApiResponse(200, null, "Unliked"))
    }

    const like = await Like.create({ comment: commentId, likedBy: req.user?._id })

    return res
        .status(201)
        .json(new ApiResponse(201, like, "Liked"))
})

// Toggle like on a tweet
const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    // 1. USE ApiError: Validate the ID format
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }

    const existingLike = await Like.findOne({ tweet: tweetId, likedBy: req.user?._id })

    if (existingLike) {
        await existingLike.deleteOne()
        return res
            .status(200)
            .json(new ApiResponse(200, null, "Unliked"))
    }

    const like = await Like.create({ tweet: tweetId, likedBy: req.user?._id })

    return res
        .status(201)
        .json(new ApiResponse(201, like, "Liked"))
})

// Get all videos liked by the current user
const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user._id),
            },
        },
        // Get the Video details
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "likedVideo",
                pipeline: [
                    {
                        // Get the Owner details (Nested Lookup)
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner",
                            },
                        },
                    },
                ],
            },
        },
        {
            $unwind: "$likedVideo",
        },
        {
            $sort: {
                createdAt: -1,
            },
        },
        {
            $project: {
                _id: 0,
                likedVideo: 1, // Only send the video object
            },
        },
    ])

    // Extract just the video objects for cleaner frontend handling
    const videos = likedVideos.map(item => item.likedVideo);

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Liked videos fetched successfully"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}