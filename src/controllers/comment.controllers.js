import mongoose from "mongoose"
import {Comment} from "../models/comment.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

// Fetches all comments for a specific video with pagination
const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const pageNumber = Number(page) || 1
    const limitNumber = Number(limit) || 10

    const pipeline = [
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "Owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $unwind: {
                path: "$owner",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                content: 1,
                video: 1,
                Owner: 1,
                createdAt: 1,
                updatedAt: 1,
                owner: {
                    username: "$owner.username",
                    avatar: "$owner.avatar"
                }
            }
        },
        { $sort: { createdAt: -1 } }
    ]

    const aggregate = Comment.aggregate(pipeline)
    const comments = await Comment.aggregatePaginate(aggregate, {
        page: pageNumber,
        limit: limitNumber
    })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                comments,
                "Comments fetched successfully"
            )
        )
})

// Adds a new comment to a specific video
const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { content } = req.body

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    if (!content || !content.trim()) {
        throw new ApiError(400, "Comment content is required")
    }

    const comment = await Comment.create({
        content: content.trim(),
        video: videoId,
        Owner: req.user?._id
    })

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                comment,
                "Comment added successfully"
            )
        )
})

// Updates an existing comment owned by the authenticated user
const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const { content } = req.body

    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id")
    }

    if (!content || !content.trim()) {
        throw new ApiError(400, "Updated content is required")
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    if (comment.Owner?.toString() !== req.user?._id?.toString()) {
        throw new ApiError(403, "You are not allowed to update this comment")
    }

    comment.content = content.trim()
    await comment.save({ validateBeforeSave: true })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                comment,
                "Comment updated successfully"
            )
        )
})

// Deletes a comment owned by the authenticated user
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id")
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    if (comment.Owner?.toString() !== req.user?._id?.toString()) {
        throw new ApiError(403, "You are not allowed to delete this comment")
    }

    await comment.deleteOne()

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                null,
                "Comment deleted successfully"
            )
        )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }