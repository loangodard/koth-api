const mongoose = require('mongoose')
const {Schema} = mongoose;

const PhysicalItemSchema = new Schema({
    nom: String,
    description: String,
    imageURL: String,
    moneyCost: Number
});


const PhysicalShopItem = mongoose.model('PhysicalShopItem', PhysicalItemSchema);
module.exports = PhysicalShopItem