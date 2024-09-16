const mongoose  = require('mongoose')

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please Enter product Name"],
        trip:true

    },
    description:{
        type:String ,
        required:[true,"Please Enter product Description"]
    },
    price:{
        type:Number,
        required: [true,"Please Enter product Price"],
        maxlength:[8,"Price cannot exeed 8 charactors"]

    },
    rating:{
       type:Number,
       default:0
    },
    images:[
        {
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    }
    ],
    category:{
        type:String ,
        required:[true,"Please Enter product Category"]
    },
    Stock:{
        type:Number,
        required:[true,"Please Enter product Stock"],
        maxLength:[4,"Stock can't exeed 4 charactors"],
        default:1
    },
    numOfRevies:{
        type:Number,
        default:0
    },
    reviews:[{
        user:{

            type: mongoose.Schema.ObjectId,
            ref:"User",
            required:true
    
        },
        name:{
            type:String,
            required:true,
        },
        rating:{
            type:Number,
            required:true
        },
        comment:{
            type:String,
            required:true
        }
    }],
    user:{

        type: mongoose.Schema.ObjectId,
        ref:"User",
        required:true

    },
    createdAt:{
        type:Date,
        default:Date.now
    }

})

module.exports = mongoose.model("product", productSchema )