import mongoose from "mongoose"
import { Video } from "../models/video.models.js"
import { Subscription } from "../models/subscription.models.js"
import { Like } from "../models/like.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// Get channel statistics for the authenticated user
const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(401, "Unauthorized access!")
    }

    const ownerObjectId = new mongoose.Types.ObjectId(userId)

    const totalVideosPromise = Video.countDocuments({
        owner: ownerObjectId,
    })

    const totalSubscribersPromise = Subscription.countDocuments({
        channel: ownerObjectId,
    })

    const totalViewsPromise = Video.aggregate([
        {
            $match: {
                owner: ownerObjectId,
            },
        },
        {
            $group: {
                _id: null,
                totalViews: {
                    $sum: "$views",
                },
            },
        },
    ])

    const totalLikesPromise = Like.aggregate([
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
            },
        },
        {
            $unwind: "$video",
        },
        {
            $match: {
                "video.owner": ownerObjectId,
            },
        },
        {
            $count: "totalLikes",
        },
    ])

    const [
        totalVideos,
        totalSubscribers,
        totalViewsAggregation,
        totalLikesAggregation,
    ] = await Promise.all([
        totalVideosPromise,
        totalSubscribersPromise,
        totalViewsPromise,
        totalLikesPromise,
    ])

    const totalViews =
        (totalViewsAggregation[0] && totalViewsAggregation[0].totalViews) || 0

    const totalLikes =
        (totalLikesAggregation[0] && totalLikesAggregation[0].totalLikes) || 0

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    totalVideos,
                    totalSubscribers,
                    totalViews,
                    totalLikes,
                },
                "Channel stats fetched successfully"
            )
        )
})

// Get all videos uploaded by the authenticated channel (published and unpublished)
const getChannelVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(401, "Unauthorized access!")
    }

    const ownerObjectId = new mongoose.Types.ObjectId(userId)

    const videos = await Video.find({
        owner: ownerObjectId,
    }).sort({
        createdAt: -1,
    })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                videos,
                "Channel videos fetched successfully"
            )
        )
})

export {
    getChannelStats, 
    getChannelVideos
    }