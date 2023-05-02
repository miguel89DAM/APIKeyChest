const { request,response } = require("express")

const validarEmail=(req=request,res=response,next)=>{
    if(/\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)/.test(req.params.email)){
        return res.status(400).json({
            msg:'The email is empty'
        });
    }
    next();
}

module.exports={
    validarEmail
}