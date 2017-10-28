'use strict';

const express = require('express');

// eslint-disable-next-line new-cap
const router = express.Router();
const knex = require('../knex');
// const humps = require('humps');
const humps= require('humps');
const boom = require('boom');

const bcrypt = require('bcrypt-as-promised');
// saltRounds is the work factor for bcrypt 2 to the tenth iterations
// const saltRounds = 10;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//IF RUN TESTS WHEN  have A NODEMON SERVER RUNNING THEN TEST WILL GIVE
//Uncaught Error: listen EADDRINUSE etc...
//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
router.get('/token', (req, res, next) => {
  // compare the req.body token value and the req.cookies (saved by cookie-parser)
  if (Object.keys(req.body).length === 0 && Object.keys(req.cookies).length === 0) {
    res.status(200)
    res.send(false)
  } else if (Object.keys(req.cookies).length > 0) {
    res.status(200)
    res.send(true);
  }
});
// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
router.post('/token', (req, res, next) => {
  // console.log(req.body);
  const {email, password} = req.body;
  //making two consts. don't need to repeat if same name?  i.e. req.body.email and email? Look this up.


  //check if email and password have been entered
  //this is NOT what makes tests 3 and 4 happy...
  if (!email || !email.trim()) {
    return res.status(404).send('No email entered');
  }
  if (!password || !password.trim()) {
    return res.status(404).send('No password entered');
  }
  //create a user to hold the row from users table
  let user;
  knex('users')
    .where('email', email)
    .first()
    .then((row) => {
      if(!row){
        throw boom.create(400, 'Bad email or password');
        //version below returns wrong Content-Type!!!!
      // return res.status(400).send('Bad email or password');
    }
    //console.log("row");
    //console.log(row);
      user = humps.camelizeKeys(row);
      //console.log("user");
      //console.log(user);


      //.compare hashes password from req.body and compares to hashedPassword in table users
      return bcrypt.compare(password, user.hashedPassword);
    })
    .then(() => {
      //create claim and token
      //console.log("user.id");
      //console.log(user.id);
      const claim = {
        userId: user.id
      };
      const token = jwt.sign(claim, process.env.JWT_KEY, {
        expiresIn: '7 days'
      });
      //console.log(claim);
      //console.log(token);


  //respond with cookie
  res.cookie('token', token, {
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    secure: router.get('env') === 'production'
  });
  delete user.hashedPassword;
  res.send(user);
//hashedPassword now only exists in table on server
//but const user still exists...

})
.catch(bcrypt.MISMATCH_ERROR, () => {
    //console.log("THIS IS req.body" + req.body);
    throw boom.create(400, 'Bad email or password');
    // return res.status(400).send('Bad email or password');
  })
  .catch((err) => {
    next(err);
  })
//.catch is what will pass tests 3 and 4?
}); //end of POST token

//DELETE THE TOKEN ::::::::::::::::::::::::::::::::::::::::::::::::
// this is used by a click event in js/nav.js (see line 18) - a logout
router.delete('/token', (req, res, next) => {
  res.clearCookie('token');
  res.end();
});
module.exports = router;
