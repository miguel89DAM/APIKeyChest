const { response, request } = require('express');
const {pool,fetchConn} = require("../config.db");
const {comparePassword, encryptPassword,generateJWT,verifyJWT,generateRandomString,encryptData,decryptData } = require("../helpers/encriptacion");


const newData=async(req=request,res=response)=>{
    //console.log(req.body); 
    const {user="", category="",name="",description="",dataPassword}= req.body; 
    
     
    let conn;
    try{
        //Verificamos que el token y la contraseña sean válidos.
        const veryToken = await verifyJWT(user.token); 
        const {uid} =veryToken;
        //Extraer contraseña maestra en la BD del usuario
        conn = await fetchConn();
        const responseQuery=await conn.query(`CALL BKEYCHEST.sp_getMasterPasswordByUserId(?)`,[uid]);
        const {masterpassword}=responseQuery[0][0];
        //Descifrar contraseña maestra con contraseña del usuario
        const decryptMasterPassword=await decryptData(masterpassword,user.passwd);
        console.log(decryptMasterPassword);
        //Cifrar datos con contraseña maestra
        const encryptedtData = await encryptData(dataPassword,decryptMasterPassword);
        console.log(encryptedtData);
        //Insertar registro
        const resultInsertData=await conn.query(`CALL BKEYCHEST.sp_insert_data(?,?,?,?,?)`,[name,description,encryptedtData,uid,category.id]);
        console.log("Resultado ",+resultInsertData);
        res.status(200).json({msg:"Hola"});   
    }catch(error){
        console.log(error);
        res.status(500).json({msg:error});            
    }finally{
        if(conn) conn.end();
    }      
    
};


module.exports={
    newData
}