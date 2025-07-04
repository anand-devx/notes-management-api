import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const noteSchema = new mongoose.Schema(
    {  
        title:{
            type:String,
            required:true
        },
        content: String,       
        tags: [String],  
        coverImage:{
            type:String,
            default:null
        },     
        coverImageID:{
            type:String,
            default:null
        },
        isPinned: {
            type:Boolean,
            default:false
        },
        about:String,
        owner:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
       
    },
    {
        timestamps:true
    }
)

noteSchema.plugin(mongooseAggregatePaginate)



export const Note = mongoose.model("Note", noteSchema)

