const { response, request } = require('express');
const {pool,fetchConn} = require("../config.db");
const {verifyJWT} = require("../helpers/encriptacion");

const getCategories =async(req=request, res=response)=>{
    let conn;    
    const {token} = req.body;
    if(token === null){
        res.status(400).json({msg:"Error: Token can't be empty"});
        return;
    }
    try{        
        const veryToken = await verifyJWT(token); 
        const {uid} =veryToken; 
        conn = await fetchConn();
        const categories=await conn.query(`CALL BKEYCHEST.sp_getCategories()`);
        if(categories === null){
            res.status(400).json({msg:"Error: "+ error.message});
            return;
        }
        const numRowsForCategory=await conn.query(`CALL BKEYCHEST.sp_getNumRecordsByCategoryForUser(?)`,uid);
        let newCategories=[];
        categories[0].forEach(item =>{
            const found = numRowsForCategory[0].find(element => element.id == item.id);
            if(found){                
                newCategories.push({id:found.id,name:found.name,numRows:parseInt(found.numRows)});
            }
            else newCategories.push({id:item.id,name:item.name,numRows:0});
                        
        });        
        res.status(200).json(newCategories);
            
    }catch(error){
        res.status(500).json({msg:error.msg});   
    }finally{
        if(conn) conn.end();
    }
}


module.exports={
    getCategories
}