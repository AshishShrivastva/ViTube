# ViTube - Project Instructions (Context)

## 1. Project Overview
ViTube is a full-stack video hosting platform with social features (Tweets). It mimics YouTube's core video functionality mixed with Twitter's community posts.

## 2. Tech Stack & Environment
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose) with Aggregation Pipelines.
- **File Storage:** Cloudinary (for Images/Videos) via Multer middleware.
- **Auth:** JWT (Access/Refresh Tokens) + Bcrypt.
- **Language:** JavaScript (ES6 Modules `import/export`).
- **Standard:** All async operations must be wrapped in `asyncHandler`. All errors must use `ApiError` class. All responses must use `ApiResponse` class.

## 3. Data Models (Existing)
- **User:** Authentication, Watch History, Avatar/CoverImage.
- **Video:** Title, Description, VideoFile (Cloudinary), Thumbnail (Cloudinary), Duration, Views.
- **Tweet:** Text content associated with a user.
- **Subscription:** Channel (creator) and Subscriber (user) relationship.
- **Like:** Polymorphic reference (can like Video, Comment, or Tweet).
- **Comment:** Text content on videos.
- **Playlist:** Collection of videos.

## 4. Coding Style Guide (Strict)
1. **Controller Structure:**
   - Always use `asyncHandler(async (req, res) => { ... })`.
   - Never write `try/catch` manually inside controllers (middleware handles it).
   - Use `res.status(code).json(new ApiResponse(code, data, message))`.
2. **Cloudinary Logic:**
   - When updating an avatar/video: Delete the old file from Cloudinary first, then upload the new one.
   - Always check if `req.file` or `req.files` exists before processing uploads.
3. **MongoDB Logic:**
   - Use Mongoose Aggregation for complex queries (Dashboard stats, Watch History).

## 5. Current Task
- The controller files contain boilerplate functions with `//TODO` comments.
- **Goal:** Implement the logic inside these functions one by one, ensuring secure database operations and correct error handling.

## 6. Mandatory Utilities (Strict Usage)
The project relies on standardized utility classes located in `src/utils/`. You must use these patterns:

### A. Error Handling (`src/utils/ApiError.js`)
- **Usage:** `throw new ApiError(statusCode, message, errors?, stack?)`
- **Example:** `throw new ApiError(404, "Video not found")`

### B. Standard Response (`src/utils/ApiResponse.js`)
- **Usage:** `new ApiResponse(statusCode, data, message?)`
- **Example:** `res.status(200).json(new ApiResponse(200, video, "Video fetched successfully"))`

### C. Async Wrapper (`src/utils/asyncHandler.js`)
- **Rule:** All controller functions must be wrapped in `asyncHandler`.
- **Pattern:** `export const myController = asyncHandler(async (req, res) => { ... })`

### D. File Services (`src/utils/cloudinary.js`)
- **Import:** `import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js"`
- **Behavior:**
  - `uploadOnCloudinary(localPath)` -> Returns `{ url: string, public_id: string }` or `null`.
  - Always `fs.unlinkSync` the local file after uploading.

## 7. Core Features & Business Logic
1.  **Video Management:**
    - Upload, publish (toggle visibility), and delete videos.
    - Cloudinary integration for storage.
2.  **Twitter-like "Tweets":**
    - Users can post text-only updates separate from videos.
3.  **Engagement (Polymorphic):**
    - **Likes:** A user can like a Video, a Tweet, or a Comment.
    - **Comments:** Nested or simple comments on videos.
    - **Subscriptions:** Users subscribe to Channels (Creators).
4.  **Playlists:**
    - Create public/private playlists.
    - Add/remove videos from playlists.
5.  **Dashboard:**
    - Creator stats: Total Video Views, Total Subscribers, Total Likes, Video Performance.
    - *Requires complex MongoDB Aggregation.*
6.  **User History:**
    - Track and display watch history.