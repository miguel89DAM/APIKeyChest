const { response, request } = require('express');
const {pool,fetchConn} = require("../config.db");
const {comparePassword, encryptPassword,generateJWT,verifyJWT,generateRandomString,encryptData,decryptData } = require("../helpers/encriptacion");
const {sendEmail } = require("../nodemailer/nodemailer");


const prueba =async(req=request, res=response)=>{
    const randomString = generateRandomString(15);
    console.log("Clave maestra en plano: " , randomString);
    const masterkey = encryptData(randomString,"Prueba@123");
    console.log("Clave maestra cifrada: ",masterkey);
    const masterkeyplain =decryptData(masterkey,"Prueba@123");
    console.log("Clave maestra descifrada: "+masterkeyplain);
    res.status(200).json({msg:"Testing API connection" });
}

/**
 * Controlador GET que activa el usuario a través de un token
 * @param {*} req 
 * @param {*} res 
 */
const verifyUser = async (req=request, res=response) => {
    const {token} = req.params;            
    let conn;
    try{        
        const veryToken = await verifyJWT(token);   
        const {uid} =veryToken; 
        conn = await fetchConn();
        const activeUser=await conn.query(`CALL BKEYCHEST.sp_activeUser(?)`,[uid]);
        if(activeUser === null){
            res.status(400).json(error);
            return;
        }
        const {affectedRows} =activeUser;
        console.log(affectedRows);
        if(affectedRows===0){
            res.status(400).json({affectedRows,
                msg:"Error: User can't be verificated. Try again" });
                return;
        }
        res.status(200).json({affectedRows,
            msg:"user successfully verified" });
            
    }catch(error){
        res.status(500).json({msg:"Error: "+ error.message});   
    }finally{
        if(conn) conn.end();
    }
};
/**
 *  Método GET que verifica la peticion de olvido de contraseña por un usuario
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const verifyRecoveryAccount=async(req=request,res=response)=>{
    const {token} = req.params;            
    let conn;
    try{        
        const veryToken = await verifyJWT(token);   
        const {uid,email,passwd} =veryToken; 
        conn = await fetchConn();
        //Eliminar datos del usuario
        const resultDeleteData=await conn.query(`CALL BKEYCHEST.sp_deleteDataByUser(?);`,[email]);
        //Cifrado de contraseña
        const password = encryptPassword(passwd);
        if(password === null){
            res.status(500).json({msg:"Error: Unexpected error. Try again"});
            return;
        }
        //Creación de masterPassword
        const randomString = generateRandomString(15);            
        const masterkey = encryptData(randomString,passwd);
        //Actualizacion del usuario en la BD
        const updateUser=await conn.query(`CALL BKEYCHEST.sp_updateUser(?,?,?)`,[email,password,masterkey]);
        //Si la contraseña no se ha modificado retornamos error
        if(updateUser.affectedRows == 0){
            res.status(400).json({msg:"Error: The user has not been modificated"});
            return;
        }
        res.status(200).json(updateUser.affectedRows);
    }catch(error){
        res.status(500).json({msg:"Error: "+ error.message});   
    }finally{
        if(conn) conn.end();
    }
}
    /**
     * Controlador POST que realiza el login del usuario
     * @param {*} req 
     * @param {*} res 
     */
    const postGetUser=async(req=request,res=response)=>{
        const {email="Nobody", passwd="Nopass"}= req.body;        
        let conn;
        try{
            conn = await fetchConn(); 
            const results= await conn.query(`CALL BKEYCHEST.sp_loginUser(?)`,[email]);
            if(results[0][0].email === -1){
                res.status(400).json({msg:"Error: User not exists"});
                return;
            }            
            const validate= await comparePassword(passwd,results[0][0].password);
            if(!validate) {
                res.status(400).json({msg:"Error: Password incorrect"});
                return;
                                
            }
            if(!results[0][0].is_active){
                res.status(400).json({msg:"Error: User not activated"});
                return;
            }
            const token =await generateJWT(results[0][0].id);
            const updateToken=await conn.query(`CALL BKEYCHEST.sp_insertToken(?,?)`,[results[0][0].id,token]);
            res.status(200).json( {id:results[0][0].id, email:results[0][0].email,token:token});
        }catch(error){
            //console.log(error);
            res.status(500).json({msg:error});            
        }finally{
            if(conn) conn.end();
        }      
        
    };

    /**
     * Controlador POST que realiza la inserción en la BD y envía email de verificacion
     * @param {*} req 
     * @param {*} res 
     */
    const insertUser=async (req=request,res=response)=>{
        const {email="Nobody", passwd="Nopass"}= req.body; 
        let conn;
        try{
            conn = await fetchConn();
            //Comprobación de que el email existe o no en la BD
            const results=await conn.query(`SELECT BKEYCHEST.fn_check_user_if_exists(?) AS checkUser;`,[email]);
            if(results[0].checkUser){
                res.status(400).json({msg:"Error: The email has been used"});
                return;
            }
            //Cifrado de contraseña
            const password = encryptPassword(passwd);
            if(password === null){
                res.status(500).json({msg:"Error: Unexpected error. Try again"});
                return;
            }
            //Creación de masterPassword
            const randomString = generateRandomString(15);            
            const masterkey = encryptData(randomString,passwd);
            //Inserción del usuario en la BD
            const insertUser=await conn.query(`CALL BKEYCHEST.sp_insert_user(?,?,?)`,[email,password,masterkey]);
            //Si la contraseña se ha creado retornamos el id del usuario               
            if(insertUser[0][0].id === null){
                res.status(400).json({msg:"Error: The user has not been created"});
                return;
            }
            //Generamos el token y lo ingresamos en la BD
            const token = await generateJWT( insertUser[0][0].id );
            await conn.query(`CALL BKEYCHEST.sp_insertToken(?,?)`,[insertUser[0][0].id,token]);
            const body=`Hi! There, You have recently visited 
            our website and entered your email.
            Please follow the given link to verify your email
            https://www.keychest.org:3300/users/verify/${token} 
            Thanks`;
            await sendEmail(email,token,body);
            res.status(200).json(insertUser[0][0].id);
        }catch(error){
             //console.log(error);
             res.status(500).json({msg:"Internal server error."}); 
        }finally{
            if(conn) conn.end();
        }
    }
    /**
     * Peticion que realiza el usuario cuando olvida la contraseña
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    const recoverAccount=async (req=request,res=response)=>{
        const {email="Nobody", passwd="Nopass"}= req.body; 
        let conn;
        try{
            conn = await fetchConn();
            //Comprobación de que el email existe o no en la BD
            const results=await conn.query(`SELECT BKEYCHEST.fn_check_user_if_exists(?) AS checkUser;`,[email]);            
            if(!results[0].checkUser){
                res.status(400).json({msg:"Error: The user is not register"});
                return;
            }
            const token = await generateJWT("", email,passwd );
            const body=`Hi! There, You have recently visited 
            our website and entered your email.
            Please follow the given link to verify your email
            https://www.keychest.org:3300/users/recovery/${token} 
            Thanks`;
            //Control de la respuesta de envio de email
            const resultEmail =await sendEmail(email,token,body);
            if(resultEmail.response.status == 400){
                res.status(400).json({msg:"Error sending email. Try againg"});
                return;
            }            
            res.status(200).json("Email sent");
            
        }catch(error){
             console.log(error);
             res.status(500).json({msg:"Internal server error."}); 
        }finally{
            if(conn) conn.end();
        }
    }

    const updateUser=async (req=request,res=response)=>{
        const {token="Nobody", email= "no_email",passwd="Nopass",tempPasswd="Nopass"}= req.body; 
        let conn;
        try{        
            const verifyToken = await verifyJWT(token);  
            const {uid} =verifyToken; 
            conn = await fetchConn();
            //Extraer contraseña maestra
            const responseQuery=await conn.query(`CALL BKEYCHEST.sp_getMasterPasswordByUserId(?)`,[uid]);
            const {masterpassword}=responseQuery[0][0];
            //Descifrar contraseña maestra con contraseña del usuario
            const decryptMasterPassword= decryptData(masterpassword,passwd);
            //Generar nueva contraseña maestra
            const randomString = generateRandomString(15);     
            //Cifrar nueva contraseña maestra       
            const newMasterkey = encryptData(randomString,tempPasswd);
            //Extraer datos del usuario de la BD
            const resultSet=await conn.query(`CALL BKEYCHEST.sp_getDataByUser(?)`,[uid]);
            //Descifrar datos con contraseña maestra antigua y cifrar datos con la nueva contraseña maestra y actualizar en BD
            resultSet[0].forEach(async item =>{    
                const decryptDataPassword=  decryptData(item.dataPassword,decryptMasterPassword);
                const encryptDataPassword=  encryptData(decryptDataPassword,randomString);        
                item.dataPassword=encryptDataPassword;
                const row =await conn.query(`CALL BKEYCHEST.sp_update_data(?,?,?,?,?,?)`,[item.id,item.name,item.description,item.dataPassword,uid,item.id_category]);
            });
            //Hashing contraseña usuario            
            const password = encryptPassword(tempPasswd);
            if(password === null){
                res.status(500).json({msg:"Error: Unexpected error. Try again"});
                return;
            }
            //Actualizacion del usuario en la BD
            const updateUser=await conn.query(`CALL BKEYCHEST.sp_updateUser(?,?,?)`,[email,password,newMasterkey]);
            //Si la contraseña no se ha modificado retornamos error
            if(updateUser.affectedRows == 0){
                res.status(400).json({msg:"Error: The user has not been modificated"});
                return;
            }        
            res.status(200).json(updateUser.affectedRows);
        }catch(error){
            res.status(400).json({msg:"Error: "+ error});   
        }finally{
            if(conn) conn.end();
        }
    }


    module.exports={
        verifyUser,
        postGetUser,
        insertUser,
        updateUser,
        recoverAccount,
        verifyRecoveryAccount,
        prueba
    }