const express = require("express");
const dotenv = require("dotenv");
const { Router } = require('express');
const { check } = require('express-validator');
dotenv.config();
const {getCategories} = require('../controllers/categories');
const {validarCampos}=require('../middlewares/validar-campos');

const router = Router();

router.post('/',[
    check('token','The token can\'t be empty').not().isEmpty(),
    validarCampos
],
getCategories);

module.exports = router;