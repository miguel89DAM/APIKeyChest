const express = require("express");
const dotenv = require("dotenv");
const { Router } = require('express');
const { check } = require('express-validator');
dotenv.config();
const {validarCampos}=require('../middlewares/validar-campos');
const{validarEmail}=require('../middlewares/validar-email');
const {verifyUser,postGetUser,insertUser,updateUser,recoverAccount,verifyRecoveryAccount,prueba} = require('../controllers/user');


const router = Router();

router.get('/prueba',prueba);

router.get('/verify/:token',verifyUser);

router.get('/recovery/:token',verifyRecoveryAccount);

router.post('/user',[
    check('email','The email can\'t be empty').not().isEmpty(),
    check('email','The email is not valid').isEmail(),
    check('passwd','The password can\'t be empty').not().isEmpty(),
    check('passwd','The password must be at least 8 caracters').isLength({min:8}),
    validarCampos
],
postGetUser);

router.post('/newUser',[
    check('email','The email can\'t be empty').not().isEmpty(),
    check('email','The email is not valid').isEmail(),
    check('passwd','The password can\'t be empty').not().isEmpty(),
    check('passwd','The password must be at least 8 caracters').isLength({min:8}),
    validarCampos
],
insertUser);

router.post('/updateUser',[
    check('token','The token can\'t be empty').not().isEmpty(),
    check('email','The email can\'t be empty').not().isEmpty(),
    check('email','The email is not valid').isEmail(),
    check('passwd','The password can\'t be empty').not().isEmpty(),
    check('passwd','The password must be at least 8 caracters').isLength({min:8}),
    validarCampos
],
updateUser);

router.post('/recovery',recoverAccount);

module.exports = router;