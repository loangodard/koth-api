const mongoose = require('mongoose')
const {Schema} = mongoose;

const matchSchema = new Schema({
    isGameOver:{type:Boolean,default:false},
    lobby:String,
    team1:[{type:String,ref:'User'}],
    team2:[{type:String,ref:'User'}],
    date_debut:Date,
    date_fin:Date,
    winner:Number, //1 or 2
    position:{
        latitude:Number,
        longitude:Number
    },
    zone:{
        type:String,
        ref:'Zone'
    },
    gain_perte:[
        {
            joueur:{type:String,ref: 'User'},
            gain_elos:Number,
            gain_coins:Number
        }
    ],
    votes:[{
        joueur:{type:String,ref:'User'},
        vote:Number //1,2
    }]
});

const Match = mongoose.model('Match', matchSchema);
module.exports = Match