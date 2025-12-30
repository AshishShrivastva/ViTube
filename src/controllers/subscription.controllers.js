import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.models.js"
import { Subscription } from "../models/subscription.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


// Toggle subscription for a channel for the current user
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel id")
    }

    const existingSubscription = await Subscription.findOne({
        channel: channelId,
        subscriber: req.user?._id
    })

    if (existingSubscription) {
        await existingSubscription.deleteOne()
        return res
            .status(200)
            .json(new ApiResponse(200, null, "Unsubscribed successfully"))
    }

    const subscription = await Subscription.create({
        channel: channelId,
        subscriber: req.user?._id
    })

    return res
        .status(201)
        .json(new ApiResponse(201, subscription, "Subscribed successfully"))
})

// Get subscriber list of a channel with basic user details
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel id")
    }

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber"
            }
        },
        { $unwind: "$subscriber" },
        {
            $project: {
                _id: 0,
                subscriberId: "$subscriber._id",
                username: "$subscriber.username",
                avatar: "$subscriber.avatar",
                email: "$subscriber.email"
            }
        }
    ])

    return res
        .status(200)
        .json(new ApiResponse(200, subscribers, "Channel subscribers fetched successfully"))
})

// Get channel list to which a user has subscribed with basic channel details
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber id")
    }

    const channels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channel"
            }
        },
        { $unwind: "$channel" },
        {
            $project: {
                _id: 0,
                channelId: "$channel._id",
                username: "$channel.username",
                avatar: "$channel.avatar"
            }
        }
    ])

    return res
        .status(200)
        .json(new ApiResponse(200, channels, "Subscribed channels fetched successfully"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}