const { response, request } = require('express');
const {pool,fetchConn} = require("../config.db");
const {comparePassword, encryptPassword,generateJWT,verifyJWT,generateRandomString,encryptData,decryptData } = require("../helpers/encriptacion");


const newData=async(req=request,res=response)=>{
    const {user="", category="",name="",description="",dataPassword}= req.body; 
    
    let conn;
    try{
        //Verificamos que el token y la contraseña sean válidos.
        const verifyToken = await verifyJWT(user.token); 
        const {uid} =verifyToken;
        //Extraer contraseña maestra en la BD del usuario
        conn = await fetchConn();
        const responseQuery=await conn.query(`CALL BKEYCHEST.sp_getMasterPasswordByUserId(?)`,[uid]);
        const {masterpassword}=responseQuery[0][0];
        //Descifrar contraseña maestra con contraseña del usuario
        const decryptMasterPassword=await decryptData(masterpassword,user.passwd);
        //Cifrar datos con contraseña maestra
        const encryptedtData = await encryptData(dataPassword,decryptMasterPassword);
        //Insertar registro
        const resultInsertData=await conn.query(`CALL BKEYCHEST.sp_insert_data(?,?,?,?,?)`,[name,description,encryptedtData,uid,category.id]);
        console.log(resultInsertData.affectedRows);
        res.status(200).json(resultInsertData.affectedRows);   
    }catch(error){
        res.status(400).json(error);            
    }finally{
        if(conn) conn.end();
    }      
    
};

const getData=async(req=request,res=response)=>{
    const {user="", category=""}= req.body;
    console.log(user.id);
    let conn;
    try{
        //Verificamos que el token y la contraseña sean válidos.
        const verifyToken = await verifyJWT(user.token); 
        const {uid} =verifyToken;
        //Extraer contraseña maestra en la BD del usuario
        conn = await fetchConn();
        const responseQuery=await conn.query(`CALL BKEYCHEST.sp_getMasterPasswordByUserId(?)`,[uid]);
        const {masterpassword}=responseQuery[0][0];
        //console.log(masterpassword);
        //Descifrar contraseña maestra con contraseña del usuario
        const decryptMasterPassword=await decryptData(masterpassword,user.passwd);        
        //Extraer datos de la BD
        const resultSet=await conn.query(`CALL BKEYCHEST.sp_getDataByUserAndCategory(?,?)`,[user.id,category.id]);
        //Descifrar contraseña de los datos
        resultSet[0].forEach(item =>{    
            const decryptDataPassword= decryptData(item.dataPassword,decryptMasterPassword);        
            item.dataPassword=decryptDataPassword;
                        
        });
        res.status(200).json(resultSet[0]);   
    }catch(error){
        res.status(400).json(error);            
    }finally{
        if(conn) conn.end();
    }      
};


const deleteData=async(req=request,res=response)=>{
    const {user="", id}= req.body;
    console.log(req.body);
    let conn;
    try{
        //Verificamos que el token sea válido.
        const verifyToken = await verifyJWT(user.token); 
        const {uid} =verifyToken;
        conn = await fetchConn();
        const responseQuery=await conn.query(`CALL BKEYCHEST.sp_deleteDataById(?)`,[id]);
        res.status(200).json(responseQuery.affectedRows);
    }catch(error){
        console.log(error)
        res.status(400).json(error);            
    }finally{
        if(conn) conn.end();
    }      
};

const updateData=async(req=request,res=response)=>{
    const {user="", category="",id,dataPassword,description,name}= req.body;
    console.log(req.body);
    let conn;
    try{
        //Verificamos que el token sea válido.
        const verifyToken = await verifyJWT(user.token); 
        const {uid} =verifyToken;
        //Extraer contraseña maestra en la BD del usuario
        conn = await fetchConn();
        const responseQuery=await conn.query(`CALL BKEYCHEST.sp_getMasterPasswordByUserId(?)`,[uid]);
        const {masterpassword}=responseQuery[0][0];
        //Descifrar contraseña maestra con contraseña del usuario
        const decryptMasterPassword=await decryptData(masterpassword,user.passwd);
        //Cifrar datos con contraseña maestra
        const encryptedtData = await encryptData(dataPassword,decryptMasterPassword);
        //Insertar registro
        const updateDataQuery=await conn.query(`CALL BKEYCHEST.sp_update_data(?,?,?,?,?,?)`,[id,name,description,encryptedtData,uid,category.id]);
        console.log(updateDataQuery)
        res.status(200).json(updateDataQuery.affectedRows);
    }catch(error){
        console.log(error.msg);
        res.status(400).json(error);            
    }finally{
        if(conn) conn.end();
    }      
};

module.exports={
    newData,
    getData,
    deleteData,
    updateData
}