const express  = require('express')
const cookieParser = require('cookie-parser');
const app = express()
const order =  require ("./routes/oderRoute")
const errorMiddleware = require('./middleware/error')
app.use(express.json());
app.use(cookieParser());
// Route imports

const product = require("./routes/productRoute");
const user = require("./routes/userRoute")
const exp = require('constants');


app.use("/api/v1",product); 
app.use("/api/v1",user);
app.use("/api/v1",order);
//Middleware for error
app.use(errorMiddleware);

module.exports = app 