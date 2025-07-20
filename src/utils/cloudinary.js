import {v2 as cloudinary} from "cloudinary";
import fs from "fs";
import streamifier from 'streamifier'

cloudinary.config(
    {
        cloud_name:process.env.CLOUD_NAME,
        api_key:process.env.API_KEY,
        api_secret:process.env.API_SECRET
    }
)
export const uploadToCloudinary = async (fileBuffer) => {
  return await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "auto" },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          secure_url:result.secure_url, 
          public_id:result.public_id
        });
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

export const deleteFromCloudinary = async  (public_id) => {
    try {
        const response = await cloudinary.uploader.destroy(public_id)
        return response
    } catch (error) {
        console.log(error);
        throw error
        return null
    }
}