import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Subscription } from "../models/subscription.models.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is required")
    }

    const tweet = await Tweet.create({
        content: content.trim(),
        owner: req.user._id
    })

    const createdTweet = await Tweet.findById(tweet._id)

    if (!createdTweet) {
        throw new ApiError(500, "Something went wrong while creating the tweet")
    }

    return res
        .status(201)
        .json(new ApiResponse(201, createdTweet, "Tweet created successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId")
    }

    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        // 1. Fetch Owner Details (Avatar & Username)
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1,
                            fullName: 1
                        }
                    }
                ]
            }
        },
        // 2. Lookup Likes for this tweet
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likeDetails"
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$ownerDetails" // Move owner from array to object
                },
                likesCount: {
                    $size: "$likeDetails" // Count the likes
                },
                isLiked: {
                    $cond: {
                        if: {$in: [req.user?._id, "$likeDetails.likedBy"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $sort: {
                createdAt: -1 // Show newest tweets first
            }
        },
        {
            $project: {
                ownerDetails: 0,
                likeDetails: 0 // Cleanup unnecessary data
            }
        }
    ])

    return res
        .status(200)
        .json(new ApiResponse(200, tweets, "User tweets fetched successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const { content } = req.body

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId")
    }

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is required")
    }

    const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only owner can edit the tweet")
    }

    tweet.content = content.trim()
    await tweet.save()

    return res
        .status(200)
        .json(new ApiResponse(200, tweet, "Tweet updated successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId")
    }

    const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only owner can delete the tweet")
    }

    await Tweet.findByIdAndDelete(tweetId)

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Tweet deleted successfully"))
})

// Get Feed (Subscribed Channels + user's Posts)
const getTweetFeed = asyncHandler(async (req, res) => {
    //Get the list of channels the user is subscribed to
    const subscriptions = await Subscription.find({ subscriber: req.user._id });
    
    const subscribedChannelIds = subscriptions.map(sub => sub.channel);

    const feedIds = [...subscribedChannelIds, req.user._id];

    //Find tweets
    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: { $in: feedIds } 
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1,
                            fullName: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likeDetails"
            }
        },
        {
            $addFields: {
                owner: { $first: "$ownerDetails" },
                likesCount: { $size: "$likeDetails" },
                isLiked: {
                    $cond: {
                        if: { $in: [req.user?._id, "$likeDetails.likedBy"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $project: {
                ownerDetails: 0,
                likeDetails: 0
            }
        }
    ])

    return res
        .status(200)
        .json(new ApiResponse(200, tweets, "Tweet feed fetched successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
    getTweetFeed
}