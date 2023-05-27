const express = require("express");
const dotenv = require("dotenv");
const { Router } = require('express');
const { check } = require('express-validator');
dotenv.config();
const {validarCampos}=require('../middlewares/validar-campos');
const {newData,getData,deleteData,updateData} = require('../controllers/data');

const router = Router();


router.post('/new',[
    check('user','The user can\'t be empty').not().isEmpty(),
    check('category','Category can\'t be empty').not().isEmpty(),
    check('dataPassword','The password can\'t be empty').not().isEmpty(),
    check('name','The name can\'t be empty').not().isEmpty(),
    validarCampos
],newData);

router.post('/getData',[
    check('user','The user can\'t be empty').not().isEmpty(),
    check('category','Category can\'t be empty').not().isEmpty(),
    validarCampos
],getData);

router.delete('/deleteData',[
    check('user','The user can\'t be empty').not().isEmpty(),
    check('id','The id data can\'t be empty').not().isEmpty(),
    validarCampos
],deleteData);

router.put('/updateData',[
    check('user','The user can\'t be empty').not().isEmpty(),
    check('category','Category can\'t be empty').not().isEmpty(),
    check('dataPassword','The password can\'t be empty').not().isEmpty(),
    check('name','The name can\'t be empty').not().isEmpty(),
    check('id','The id data can\'t be empty').not().isEmpty(),
    validarCampos
],
updateData);



module.exports = router;