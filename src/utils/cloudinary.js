import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from "dotenv"

dotenv.config()

//cloudinary Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async(localFilePath) => {
    try{
        if(!localFilePath) return null
        const response = await cloudinary.uploader.upload(
            localFilePath, {
                resource_type: "auto"
            }
        )
        console.log("File uploaded on cloudinary. File src: " + response.url)
        //once the file is uploaded, we would like to delete it from our servers
        fs.unlinkSync(localFilePath)
        return response
    }
    catch(error){
        console.log("Error on cloudinary", error)
        fs.unlinkSync(localFilePath)
        return null
    }
}

const deleteFromCloudinary = async (publicId) => {
    try{
        const result = await cloudinary.uploader.destroy(publicId)
        console.log("Deleted from cloudinary. Public ID: ", publicId)
    }
    catch(error){
        console.log("Error deleting files from cloudinary", error)
        return null
    }
}

// Helper function to extract public_id from Cloudinary URL
const extractPublicIdFromUrl = (url) => {
    if (!url) return null
    try {
        // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/v{version}/{public_id}.{format}
        // or: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{public_id}
        const parts = url.split('/upload/')
        if (parts.length < 2) return null
        let publicIdPart = parts[1]
        // Remove version prefix if present (v1234567890/)
        publicIdPart = publicIdPart.replace(/^v\d+\//, '')
        // Remove file extension
        publicIdPart = publicIdPart.replace(/\.[^.]*$/, '')
        return publicIdPart
    } catch (error) {
        console.log("Error extracting public_id from URL", error)
        return null
    }
}

export { uploadOnCloudinary, deleteFromCloudinary, extractPublicIdFromUrl }