const mongoose = require('mongoose')
const {Schema} = mongoose;

const userSchema = new Schema({
    pseudo:String,
    tel:String,
    password:String,
    elos:[{
        zone:{type:String,ref:'Zone'},
        elo:{type:Number,default:1000}
    }],
    coins:{type:Number,default:0},
    isTelVerified:{type:Boolean,default:false},
    login_token:String,
    elos_historique:{
        type: [{date:Date,elos:Number,zone:String}],
        default: [{date: new Date(),elos : 1000}],
        zone:{type:String,ref:'Zone'}
    }
});


const User = mongoose.model('User', userSchema);
module.exports = User