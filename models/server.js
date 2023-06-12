const express = require('express');
const dotenv = require("dotenv");
const cors = require('cors');
const fs = require('fs');
//Requerir paquete https
const https= require("https");
const http= require("http");
const morgan = require("morgan");

class Server{
    constructor(){
        this.app = express();
        morgan.token('date', (req, res, tz) => {
            return new Date().toLocaleString('es-ES');
        })
        morgan.format('myformat', ':remote-addr - :remote-user [:date] :method :url HTTP/:http-version" :status :res[content-length]');
        this.app.use(morgan('myformat'));
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