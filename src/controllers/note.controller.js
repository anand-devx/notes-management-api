import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Note } from "../models/note.model.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const createNote = asyncHandler(async(req, res) => {
    
    const user = req.user
    if(!user){
        throw new ApiError(400, "Unauthorised Request! Login!")
    }

    const {title, content, tags, isPinned, about} = req.body

    if(!title){
        throw new ApiError(400, "Title is required")
    }

    const coverImageLocalPath = req.files?.coverImage?.[0]?.path
    let coverImage;
    if(coverImageLocalPath){
        coverImage = await uploadToCloudinary(coverImageLocalPath)
        if(!coverImage) {
            throw new ApiError(400, "Image upload failed")
        }
    }
    
    const note = await Note.create(
        {
            title,
            content,
            tags,
            isPinned,
            about,
            coverImage: coverImage?.secure_url,
            coverImageID:coverImage?.public_id || "",
            owner:new mongoose.Types.ObjectId(user._id)
        }
    )
    return res.status(200).json(
        new ApiResponse(200, note, "Note created Successfully")
    )

})

const getNote = asyncHandler(async(req,res) => {
    const {title} = req.params
    console.log(title);
    if(!title){
        throw new ApiError(400, "Please Provide the Note's Title in parameter")
    }

    const note = await Note.findOne({title})

    if(!note){
        throw new ApiError(404, "Note Not found!")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, 
            note,
            "Note Found!"
        )
    )

})

const updateNote = asyncHandler(async(req, res) => {
    const user = req.user
    if(!user){
        throw new ApiError(400, "Unauthorised Request, Please login")
    }
    const {noteID} = req.params
    if(!noteID) {
        throw new ApiError(400, "Provide Note Id in params")
    }
    var updatedFields = {}
    const {title, content, about, isPinned, tags} = req.body
    if(!title && !content && !about && !(tags) && (isPinned==="" || isPinned===undefined) ){
        throw new ApiError(400, "Atleast one field required")
    }
    
    if(title){
        const existedTitle = await Note.aggregate([
            {
                $match:{
                    owner: user._id
                }
            },
            {
                $match:{
                    title
                }
            }
        ])
        console.log(existedTitle);
        if(existedTitle.length!==0){
            throw new ApiError(400, "Title already used, please try another title")
        }
        updatedFields.title = title
    }
    if(content) updatedFields.content = content
    if(about) updatedFields.about = about
    if(isPinned) updatedFields.isPinned = isPinned
    if(tags) updatedFields.tags = tags
    
    let coverImage;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path
    if(coverImageLocalPath){
        coverImage = await uploadToCloudinary(coverImageLocalPath)
        if(!coverImage){
            throw new ApiError(400, "Error while uploading Cover Image")
        }
        else {
            updatedFields.coverImage = coverImage?.secure_url
            updatedFields.coverImageID = coverImage?.public_id
        }
    }
  
    const note = await Note.findByIdAndUpdate(noteID,
        {
            $set:updatedFields
        },
        {
            new:true
        }
    )
    if(!note){
        throw new ApiError(400, "Error while updating Note")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, note, "Successfully updated Note")
    )
})

const deleteNote = asyncHandler(async(req, res) => {
    const {noteID} = req.params
    if(!noteID) {
        throw new ApiError(400, "Provide Note Id in params")
    }

    let deletedNote;
    try {
        const note = await Note.findById(noteID)
        const deleteCoverImage = await deleteFromCloudinary(note.coverImageID)
        console.log(deleteCoverImage);
        deletedNote = await Note.findByIdAndDelete(noteID)
    
    } catch (error) {
        throw new ApiError(400, "Error while finding and deleting the note, check Note ID")
    }
    if(!deletedNote){
        throw new ApiError(400, "Failed to delete Note")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, deletedNote, "Note deleted Successfully")
    )
    
}) 

export {
    createNote,
    getNote,
    updateNote,
    deleteNote
}