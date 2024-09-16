const ErrorHandler = require('../utils/errorhandler')


module.exports = (err,req,res,next) =>{
    err.statusCode = err.statusCode || 500 ;
    err.message = err.message || "Internal server Error";

     //Wrong mongobd id err  ---> cast error
     if(err.name === "CastError"){
        const message = `Resource not found . Invalid:${err.path}`
        err = new ErrorHandler(message,400);
     }
    // mongoose duplicate key error

    if(err.code === 11000){
       const message = `Duplicate ${Object.keys(err.keyValue)} Entered`
       err = new ErrorHandler(message,400);
    }

    //Wrong JWT error
    if(err.code === "JsonWebTokenError"){
        const message = `Json web Token is invalid ,try again `
        err = new ErrorHandler(message,400);
     }
     //Jwt expire error
     if(err.code === "TokenExpiredError"){
        const message = `Json web Token is Expired ,try again `;
        err = new ErrorHandler(message,400);
     }


    res.status(err.statusCode).json({
        success:false,
        message: err.message 
    })
}