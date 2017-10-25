'use strict';

const express = require('express');

// eslint-disable-next-line new-cap
const router = express.Router();
const knex = require('../knex');
const humps =require('humps');
const boom = require('boom');

const bcrypt = require('bcrypt-as-promised');
//what is promisifying bcr?
// saltRounds is the work factor for bcrypt 2 to the tenth iterations
const saltRounds = 10;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');


console.log("before everything");
router.get('/token', (req, res,next) => {
  // compare the req.body token value and the req.cookies (saved by cookie-parser)
  if(Object.keys(req.body).length===0 && Object.keys(req.cookies).length===0){
    //the status is fine but there's no cookie?
    res.status(200)
    res.send(false)
  }else if (Object.keys(req.cookies).length>0){
    res.status(200)
    res.send(true);
  }
});
// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
router.post('/token', (req, res, next)=>{
  //check if email and password have been entered (this is test 3 & 4)
  //use knex to find the user row associated with the email
  //bcrypt.compare hashed password in request and the hashed password from user table
  //create claim and token
  //respond with cookie
  //
})//end of post token
router.delete('/token', (req, res, next)=>{
  res.clearCookie('token');
  res.end();
});
module.exports = router;
