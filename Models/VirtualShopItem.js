const mongoose = require('mongoose')
const {Schema} = mongoose;

const VirtualItemSchema = new Schema({
    nom: String,
    description: String,
    imageURL: String,
    coinCost: Number, 
    moneyCost: Number
    
});


const VirtualShopItem = mongoose.model('VirtualShopItem', VirtualItemSchema);
module.exports = VirtualShopItem