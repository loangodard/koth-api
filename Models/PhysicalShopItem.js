const mongoose = require('mongoose')
const {Schema} = mongoose;

const PhysicalItemSchema = new Schema({
    nom: String,
    description: String,
    imageURL: String,
    moneyCost: Number,
    enable:Boolean, //Activé ou non,
    tailles:[{String}],
    parametres:[{nom_param:String,valeur:String,_id:false}],
    stock:Number
});


const PhysicalShopItem = mongoose.model('PhysicalShopItem', PhysicalItemSchema);
module.exports = PhysicalShopItem