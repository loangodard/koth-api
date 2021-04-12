const express = require('express')
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
const app = express()

const http = require('http')
const server = http.createServer(app);

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

/**
 * Socket io
 */
const io = require('socket.io')(server);
const sockets = require('./Sockets/Sockets')
sockets.manageSockets(io)

/**
 * Import des variables d'environnements
 */
require('dotenv').config(); 

/**
 * BodyParser Configuration
 */
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

/**
 * MongoDB Connection
 */
let uri
if(process.env.DEV == "True"){
    uri = `mongodb+srv://${process.env.MONGO_DB_USER_DEV}:${process.env.MONGO_DB_PASSWORD_DEV}@cluster0.b1kbx.mongodb.net/${process.env.MONGO_DB_DBNAME}?retryWrites=true&w=majority`
}else{
    uri = `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@lfc-dufxi.mongodb.net/${process.env.MONGO_DB_DBNAME}?retryWrites=true&w=majority`
}

console.log(uri)

mongoose.connect(uri, { useNewUrlParser: true,useUnifiedTopology: true},()=>{
    console.log('connected to mongodb')
    server.listen(process.env.PORT || 4000, () => {
        console.log('listening on 4000')
    })
});

/**
 * Routeurs
 */
let rnAppRoutes = require("./Routes/rnApp");
app.use('/', rnAppRoutes)