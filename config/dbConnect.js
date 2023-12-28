const mongoose = require('mongoose')
const dbConnect =()=>{
    try{
        const conn = mongoose.connect(process.env.MONGODB_URI)
        console.log("Database Connected")
    }catch(err){
console.log("Database Error")
    }
}
module.exports = dbConnect;