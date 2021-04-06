const mongoose = require('mongoose')
const {Schema} = mongoose;

const reportSchema = new Schema({
    user:{type:String,ref:'User'},
    match:{type:String,ref:"Match"},
    message:String,
    date:Date
});


const Report = mongoose.model('Report', reportSchema);
module.exports = Report