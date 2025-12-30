import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary, deleteFromCloudinary, extractPublicIdFromUrl} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query

    // Build match stage for aggregation pipeline
    const matchStage = {}
    
    // Add query filter (search by title/description)
    if (query) {
        matchStage.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ]
    }
    
    // Add userId filter if provided
    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid userId")
        }
        matchStage.owner = new mongoose.Types.ObjectId(userId)
    }
    
    // Only show published videos by default (unless userId filter is applied)
    if (!userId) {
        matchStage.isPublished = true
    }

    // Build sort stage
    const sortStage = {}
    const sortOrder = sortType === "asc" ? 1 : -1
    sortStage[sortBy] = sortOrder

    // Aggregation pipeline
    const pipeline = [
        { $match: matchStage },
        { $sort: sortStage },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullname: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        }
    ]

    // Pagination options
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    }

    // Execute aggregation with pagination
    const result = await Video.aggregatePaginate(
        Video.aggregate(pipeline),
        options
    )

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Videos fetched successfully"))
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description, duration } = req.body

    // Validate required fields
    if (!title || !description) {
        throw new ApiError(400, "Title and description are required")
    }

    // Check if files are uploaded
    const videoFileLocalPath = req.files?.videoFile?.[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path

    if (!videoFileLocalPath) {
        throw new ApiError(400, "Video file is required")
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required")
    }

    // Upload video file to Cloudinary
    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    if (!videoFile || !videoFile.url) {
        throw new ApiError(500, "Failed to upload video file")
    }

    // Upload thumbnail to Cloudinary
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    if (!thumbnail || !thumbnail.url) {
        // If thumbnail upload fails, delete the uploaded video
        if (videoFile.public_id) {
            await deleteFromCloudinary(videoFile.public_id)
        }
        throw new ApiError(500, "Failed to upload thumbnail")
    }

    // Create video document
    const video = await Video.create({
        title,
        description,
        duration: parseFloat(duration) || 0,
        videoFile: videoFile.url,
        videoFilePublicId: videoFile.public_id,
        thumbnail: thumbnail.url,
        thumbnailPublicId: thumbnail.public_id,
        owner: req.user._id
    })

    // Fetch the created video with owner details
    const createdVideo = await Video.findById(video._id).populate(
        "owner",
        "username fullname avatar"
    )

    if (!createdVideo) {
        throw new ApiError(500, "Failed to create video")
    }

    return res
        .status(201)
        .json(new ApiResponse(201, createdVideo, "Video published successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    // Find video and populate owner details
    const video = await Video.findById(videoId).populate(
        "owner",
        "username fullname avatar"
    )

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    // Increment views
    video.views += 1
    await video.save()

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    // Find the video
    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    // Check if user owns the video
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You don't have permission to update this video")
    }

    // Update title and description if provided
    const updateFields = {}
    if (title) {
        updateFields.title = title
    }
    if (description) {
        updateFields.description = description
    }

    // Handle thumbnail update if provided
    const thumbnailLocalPath = req.file?.path
    if (thumbnailLocalPath) {
        // Delete old thumbnail from Cloudinary
        if (video.thumbnailPublicId) {
            await deleteFromCloudinary(video.thumbnailPublicId)
        }

        // Upload new thumbnail to Cloudinary
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
        if (!thumbnail || !thumbnail.url) {
            throw new ApiError(500, "Failed to upload thumbnail")
        }

        updateFields.thumbnail = thumbnail.url
        updateFields.thumbnailPublicId = thumbnail.public_id
    }

    // Update video
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: updateFields
        },
        { new: true }
    ).populate("owner", "username fullname avatar")

    if (!updatedVideo) {
        throw new ApiError(500, "Failed to update video")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "Video updated successfully"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    // Find the video
    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    // Check if user owns the video
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You don't have permission to delete this video")
    }

    // Delete video file from Cloudinary
    if (video.videoFilePublicId) {
        await deleteFromCloudinary(video.videoFilePublicId)
    } else {
        // Fallback: extract public_id from URL if not stored
        const publicId = extractPublicIdFromUrl(video.videoFile)
        if (publicId) {
            await deleteFromCloudinary(publicId)
        }
    }

    // Delete thumbnail from Cloudinary
    if (video.thumbnailPublicId) {
        await deleteFromCloudinary(video.thumbnailPublicId)
    } else {
        // Fallback: extract public_id from URL if not stored
        const publicId = extractPublicIdFromUrl(video.thumbnail)
        if (publicId) {
            await deleteFromCloudinary(publicId)
        }
    }

    // Delete video document from MongoDB
    await Video.findByIdAndDelete(videoId)

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    // Find the video
    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    // Check if user owns the video
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You don't have permission to toggle publish status of this video")
    }

    // Toggle publish status
    video.isPublished = !video.isPublished
    await video.save()

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Publish status toggled successfully"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}