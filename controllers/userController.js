const ErrorHander = require("../utils/errorhandler");
const catchAsyncError = require("../middleware/catchAsyncErrors");
const crypto = require("crypto");
const User = require('../models/userModel');
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
// function for register a user

exports.registerUser = catchAsyncError(async(req,res,next)=>{

    const {name,email,password} = req.body;
    const user = await User.create({
        name,email,password,
        avatar:{
            publid_id:"this is a sample id",
            url:"profilepicUrl"
        },
    });
  sendToken(user,201,res);
 
});

// Login user Function
exports.loginUser = catchAsyncError(async (req,res,next) => {
    const {email,password} = req.body;


    if(!email||!password){
        return next(new ErrorHander("Please enter email and password ", 400))
    }
    const user = await User.findOne({email}).select("+password")
    if(!user){
        return next(new ErrorHander("Invalid email or password",401));
    }
    const isPasswordMatched = await user.comparePassword(password);
    if(!isPasswordMatched ){
        return next(new ErrorHander("Invalid email or password",401));
    }
 
   sendToken(user,200,res);
    
})

//LogOut function

exports.logout = catchAsyncError(async (req,res,next) => {

   res.cookie("token",null,{
    expires:new Date(Date.now()),
    httpOnly:true
   })

    res.status(200).json({
        success:true,
        message:"Logged Out"
    })
});

//Forgot Password 

exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
  
    if (!user) {
      return next(new ErrorHander("User not found", 404));
    }
  
    // Get ResetPassword Token
    const resetToken = user.getResetPasswordToken();
  
    await user.save({ validateBeforeSave: false }); 
  
    const resetPasswordUrl = `${req.protocol}://${req.get(
      "host"
    )}/password/reset/${resetToken}`;
  
    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\n If you have not requested this email then, please ignore it.`;
  console.log(message);
    try {
      await sendEmail({
        email: user.email,
        subject: `Ecommerce Password Recovery`,
        message,
      });
  
      res.status(200).json({
        success: true,
        message: `Email sent to ${user.email} successfully`,
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
  
      await user.save({ validateBeforeSave: false });
  
      return next(new ErrorHander(error.message, 500));
    }
  });

  // reset password 

  exports.resetPassword = catchAsyncError(async (req,res,next) => {
 
    //creating token hash
    const resetPasswordToken = crypto 
    .createHash("sha256")
    .update(req.params.token) 
    .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire:{$gt: Date.now()},
    });

    
    if (!user) {
      return next(
        new ErrorHander(
          "Reset Password Token is invalid or has been expired",
           404)
          );
      }
    if(req.body.password !== req.body.confirmPassword){
      return next(new ErrorHander("Password does not match" , 400)

      );
    }
    user.password = req.body.password;
    user.resetPasswordToken =undefined;
    user.resetPasswordExpire = undefined;

   await  user.save(); 

   sendToken(user,200,res);
     
  });
  

  //Get User Details jo login hoga vhi access krega

  exports.getUserDetails = catchAsyncErrors(async(req,res,next) => {
    const user = await User.findById(req.user.id); // req.user me user already save hoga register krte hi
    res.status(200).json({
      success:true,
      user,
    })
  });

  //update User Password
  exports.updatePassword = catchAsyncErrors(async(req,res,next) => {
    const user = await User.findById(req.user.id).select("+password"); // req.user me user already save hoga register krte hi

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if(!isPasswordMatched ){
        return next(new ErrorHander("Old password is incorrect ",400));
    }
    if(req.body.newPassword !== req.body.confirmPassword){
      return next(new ErrorHander("Old password is incorrect ",400));
    }
    user.password = req.body.newPassword;
    await user.save();
     sendToken(user,200,res);
  });


  //update User Profile
  exports.updateUserProfile= catchAsyncErrors(async(req,res,next) => {
    
     const newUserData = {
      name: req.body.name,
      email: req.body.email,
     }
      
     // we will add cloudanary later

     const user = await User.findByIdAndUpdate(req.user.id,newUserData,{
      new:true,
      runValidators:true,
      useFindAndModify: false
     })

 
     res.status(200).json({
        success:true,

     })
  });

  // Get all users

  exports.getAllUser = catchAsyncError(async (req,res,next) => {
          
    const users = await User.find();

    res.status(200).json({
      success:true,
      users,
    });
  }); 

  // Get single user -->ADMIN

  exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);
  
    if (!user) {
      return next(
        new ErrorHander(`User does not exist with Id: ${req.params.id}`)
      );
    }
  
    res.status(200).json({
      success: true,
      user,
    });
  });
  

    // Update User Role  --- ADMIN
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
  });
});

   
    //Delete User  --- ADMIN
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHander(`User does not exist with Id: ${req.params.id}`, 400)
    );
  }

  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "User Deleted Successfully",
  });
});

