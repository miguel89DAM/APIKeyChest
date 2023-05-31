//dotenv nos permite leer las variables de entorno de nuestro .env
const dotenv = require("dotenv");
const fs = require('fs');
//const tls = require('node:tls');
const mariadb = require('mariadb');
dotenv.config();

const pool = mariadb.createPool({
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASS,
    database: process.env.DBNAME,
    connectionLimit: 10,
    idleTimeout:300,
    trace:true
    /*ssl:{
        ca:fs.readFileSync(__dirname+'/certificates/ca.pem'),
        key:fs.readFileSync(__dirname+'/certificates/client-key.pem'),
        cert:fs.readFileSync(__dirname+'/certificates/client-cert.pem'),
        checkServerIdentity: function (host, cert) {
            return undefined;
            }
    }*/

});

// Fetch Connection
async function fetchConn() {
    let conn = await pool.getConnection();
    //console.log("Total connections: ", pool.totalConnections());
    //console.log("Active connections: ", pool.activeConnections());
    //console.log("Idle connections: ", pool.idleConnections());
    return conn;
 }

module.exports = {pool,fetchConn};