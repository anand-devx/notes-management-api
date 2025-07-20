import multer from "multer";

// Set storage engine
const storage = multer.memoryStorage()

export const upload = multer({
    storage:storage
})