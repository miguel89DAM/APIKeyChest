const express = require("express");
const fs = require('fs');
const app = express();
const cors =require('cors');

//Requerir paquete https
const https= require("https");

const jwt = require('jsonwebtoken');



//cargamos el archivo de rutas
app.use(require('./routes/user'));

//Middlewares

midlewares();

//Creación del https
https.createServer(
    {
        key:fs.readFileSync(__dirname+'/certificates/certWeb/webkey.pem'),
        cert:fs.readFileSync(__dirname+'/certificates/certWeb/webcert.pem')
    },
    app
    ).listen(process.env.PORT||3300,() => {
        console.log("Servidor corriendo en el puerto 3300");
    });




module.exports = app;
