import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json({ limit : "16Kb"}));
app.use(express.urlencoded({extended: true, limit: "16Kb"}))
app.use(express.static("public"))
app.use(cookieParser())

app.get('/',(req,res)=>{
    res.json({
        "register user":"/register",
        "login user":"/login",
        "refresh tokens":"/refresh-tokens",
        "change password":"/change-password",
        "update details":"/update-details",
        "create note":"/notes/create",
        "read all notes":"/notes/read-all",
        "read note with title":"/notes/read-one/:title",
        "update note with ID":"/notes/update/:noteID",
        "":"",
        "delete note with ID":"/notes/delete/:noteID",
    });
})

// import 
import router from "./routes/user.route.js";
import { errorHandler } from "./middlewares/errorhandler.middleware.js"

app.use("/api/v1/users",router)
app.use(errorHandler)

export {app}