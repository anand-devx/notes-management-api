import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

cloudinary.config(
    {
        cloud_name:process.env.CLOUD_NAME,
        api_key:process.env.API_KEY,
        api_secret:process.env.API_SECRET
    }
)
const uploadToCloudinary = async function(localFilePath){ 
    try {
        if(!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath,
            {
                resource_type: "auto"
            }
        )
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath)
        throw error; 
        return null
    }
}

const deleteFromCloudinary = async  (public_id) => {
    try {
        const response = await cloudinary.uploader.destroy(public_id)
        return response
    } catch (error) {
        console.log(error);
        throw error
        return null
    }
}




export {uploadToCloudinary,
    deleteFromCloudinary
}
