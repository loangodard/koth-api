const mongoose = require('mongoose')
const {Schema} = mongoose;

const orderSchema = new Schema({
    date_order:Date,
    user:{type:String,ref:'User'},
    items:[{}],
    monney_price:Number,
    coins_price:Number,
    shipping_adress:{
        nom:String,
        prenom:String,
        numero_voie:String,
        cp:String,
        ville:String,
        complement_adresse:String
    }
});


const Order = mongoose.model('Order', orderSchema);
module.exports = Order