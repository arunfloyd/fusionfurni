const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true,
    },
    description:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        // required:true,
    },
    image:{
        type:String,
    },
    category:{
        type:String,
        // required:true,
    },
    productDetails:{
        type:String,

    },
    specification:{
        type:String,

    },
    list:{
        type:Boolean,
    },
    warranty:{
        type:String,

    },
    material:{
        type:String,
        // required:true,
    },
    quanity:Number,
    sold:{
        type:Number,
        default:0,
    },
    images:{
        type: [String]
    },color:{
        type:String,
        // required:true,
    },rating:[{
        star:Number,
        postedby:{type:mongoose.Schema.Types.ObjectId,ref:"User"}
    }]
},{
    timestamps:true
});

//Export the model
module.exports = mongoose.model('Product', productSchema);