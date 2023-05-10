const express = require('express');
const dotenv = require("dotenv");
const cors = require('cors');
const fs = require('fs');
//Requerir paquete https
const https= require("https");
const http= require("http");

class Server{
    constructor(){
        this.app = express();
        this.port =process.env.PORT;

        this.paths={
            users: '/users',
            categories: '/categories',
            data: '/data'
        }

        this.midlewares();

        this.routes();
    }

    midlewares(){
        this.app.use(cors());
        //nos ayuda a analizar el cuerpo de la solicitud POST
        this.app.use(express.json());
        this.app.use(express.urlencoded({extended: true}));
    }

    routes(){
        this.app.use(this.paths.users, require('../routes/user'));
        this.app.use(this.paths.categories, require('../routes/categories'));
        this.app.use(this.paths.data, require('../routes/data'));
    }

    listen(){
        https.createServer(
        {
            key:fs.readFileSync(process.env.SSL_WEBKEY),
            cert:fs.readFileSync(process.env.SSL_WEBCERT)
        },
        this.app
        ).listen(process.env.PORT||3300,() => {
                console.log("Servidor corriendo en el puerto 3300");
        });
    }
}

module.exports = Server;