import {Like} from "../models/like.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

// Toggle like on a video for the current user
const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params

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

// Toggle like on a comment for the current user
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params

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

// Toggle like on a tweet for the current user
const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

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
                likedBy: req.user?._id,
                video: { $exists: true, $ne: null }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video"
            }
        },
        { $unwind: "$video" },
        {
            $project: {
                _id: "$video._id",
                title: "$video.title",
                description: "$video.description",
                thumbnail: "$video.thumbnail",
                duration: "$video.duration",
                views: "$video.views",
                isPublished: "$video.isPublished",
                owner: "$video.owner",
                createdAt: "$video.createdAt"
            }
        }
    ])

    return res
        .status(200)
        .json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}