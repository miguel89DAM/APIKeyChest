const express = require("express");
const dotenv = require("dotenv");
const { Router } = require('express');
const { check } = require('express-validator');
dotenv.config();
const {validarCampos}=require('../middlewares/validar-campos');
const {newData} = require('../controllers/data');

const router = Router();


router.post('/new',newData);

module.exports = router;