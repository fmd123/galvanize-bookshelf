'use strict';

const express = require('express');

// eslint-disable-next-line new-cap
const router = express.Router();
const knex = require('../knex');
const humps = require('humps');
const bcrypt = require('bcrypt');
const saltRounds = 10;


router.post('/users', (req, res, next)=>{
  knex('users')
  .insert({
    first_name:req.body.firstName,
    last_name:req.body.lastName,
    email:req.body.email,
    hashed_password:bcrypt.hashSync(req.body.password, saltRounds)}, ['id', 'first_name', 'last_name', 'email'])
    .then((result)=>{
      result = humps.camelizeKeys(result);
      res.send(result[0]);
    })
    .catch((err)=>{
      console.error(err);
    })
  })



module.exports = router;
