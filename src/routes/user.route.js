import {Router} from "express";
import { 
    loginUser, 
    logoutUser, 
    registerUser, 
    refreshTokens, 
    changeCurrentPassword, 
    updateAccountDetails,
    getNotes
    } from "../controllers/user.controller.js";

import {
    createNote,
    deleteNote,
    getNote,
    updateNote
} from '../controllers/note.controller.js'

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router()

router.route("/register").post(
    upload.fields(
       [
         {
            name:"avatar",
            maxCount:1
        }
       ]
    )
    , registerUser)
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-tokens").post(refreshTokens)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/update-details").post(verifyJWT,
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        }
    ]),
    updateAccountDetails)
router.route("/notes/create").post(verifyJWT,
    upload.fields([
        {
        name:"coverImage",
        maxCount:1
        }
    ])
    ,createNote)
router.route("/notes/read-all/").get(verifyJWT, getNotes)
router.route("/notes/read-one/:title").get(verifyJWT, getNote)
router.route("/notes/update/:noteID").post(verifyJWT, 
    upload.fields([
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    updateNote)
router.route("/notes/delete/:noteID").get(verifyJWT, deleteNote)

export default router