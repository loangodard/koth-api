const express = require('express')
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
const app = express()

//TODO : delete it in production
app.use(function(req, res, next) { //allow cross origin requests;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
    res.header("Access-Control-Max-Age", "3600");
    res.header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    next();
});

const http = require('http')
const server = http.createServer(app);

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
const uri = `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@lfc-dufxi.mongodb.net/${process.env.MONGO_DB_DBNAME}?retryWrites=true&w=majority`
mongoose.connect(uri, { useNewUrlParser: true,useUnifiedTopology: true},()=>{
    console.log('connected to mongodb')
    server.listen(4000, () => {
        console.log('listening on 4000')
    })
});

/**
 * Routeurs
 */
let rnAppRoutes = require("./Routes/rnApp");
app.use('/', rnAppRoutes)