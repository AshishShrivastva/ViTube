import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


// create a new playlist
const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    if (!name) {
        throw new ApiError(400, "Playlist name is required")
    }

    const playlist = await Playlist.create({
        name,
        description: description || "",
        owner: req.user?._id
    })

    if (!playlist) {
        throw new ApiError(500, "Failed to create playlist")
    }

    return res
        .status(201)
        .json(new ApiResponse(201, playlist, "Playlist created successfully"))
})

// get all playlists for a user
const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id")
    }

    const playlists = await Playlist.find({owner: userId})

    return res
        .status(200)
        .json(new ApiResponse(200, playlists, "User playlists fetched successfully"))
})

// get a single playlist by id
const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist fetched successfully"))
})

// add a video to a playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist or video id")
    }

    const playlist = await Playlist.findOneAndUpdate(
        {_id: playlistId, owner: req.user?._id},
        {$addToSet: {videos: videoId}},
        {new: true}
    )

    if (!playlist) {
        throw new ApiError(404, "Playlist not found or not authorized")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Video added to playlist"))
})

// remove a video from a playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist or video id")
    }

    const playlist = await Playlist.findOneAndUpdate(
        {_id: playlistId, owner: req.user?._id},
        {$pull: {videos: videoId}},
        {new: true}
    )

    if (!playlist) {
        throw new ApiError(404, "Playlist not found or not authorized")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Video removed from playlist"))

})

// delete a playlist
const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id")
    }

    const playlist = await Playlist.findOneAndDelete({
        _id: playlistId,
        owner: req.user?._id
    })

    if (!playlist) {
        throw new ApiError(404, "Playlist not found or not authorized")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist deleted successfully"))
})

// update a playlist
const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id")
    }

    const updateData = {}
    if (name) updateData.name = name
    if (description) updateData.description = description

    const playlist = await Playlist.findOneAndUpdate(
        {_id: playlistId, owner: req.user?._id},
        {$set: updateData},
        {new: true}
    )

    if (!playlist) {
        throw new ApiError(404, "Playlist not found or not authorized")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist updated successfully"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}