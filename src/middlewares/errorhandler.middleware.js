export const errorHandler = (err, req, res, next) =>{
    const statusCode = err.statusCode || 500
    return res
    .status(statusCode)
    .json({
        statusCode,
        message:err.message || "Internal Server Error",
        stack: process.env.NODE_ENV === "production" ? null : err.stack
    })
}