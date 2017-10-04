'use strict';

const express = require('express');
const knex = require('../knex');
const {
  camelizeKeys,
  decamelizeKeys
} = require('humps');
const router = express.Router();


router.get('/books', (req, res, next) => {
  knex('books')
    .orderBy('title')
    .then((result) => {
      const list = camelizeKeys(result)
      res.json(list);
    })
    .catch((err) => {
      next(err)
    })

});

//READ (get) a book by id
router.get('/books/:id', (req, res, next) => {
  const book = req.params
  const id = Number.parseInt(req.params.id)
  //condition needed for id problems
  if(Number.isNaN(id)){
    return res.sendStatus(404)
  }
  //knex query builder
  knex('books')
    .where('id', id)
    //select by id
    .first()
    //.first will return first item inside the array which is an object
    .then((result) => {
      const book = camelizeKeys(result)
      console.log(book);
      res.json(book);
      //use res.json INSTEAD OF: 
      //res.setHeader('Content-Type', 'application/json')
      //res.send(JSON.stringify(items))
      knex(destroy);
    })
    .catch((err) => {
      next(err)
    })
})

//CREATE A book (Insert)
// router.post('/books', (req,res,next)=>{
//   const id = Number.parseInt(req.params.id)
//   //conditions needed for input problems
//   //knex query builder
//   knex('books')
//    .create({ })
//    .then((result)=>{
//
//      res.send('')
//      knex(destroy);
//    })
//    .catch((err)=>{
//      console.log(err);
//      knex(destroy);
//      process.exit(1)
//    })
//
//
// })


//UPDATE a book's table entry
// router.get('/books/:id', (req,res,next)=>{
//   const id = Number.parseInt(req.params.id)
//   //condition needed for id problems
//   //knex query builder
//   knex('books')
//    .update('')
//    .where('id', id)
//    .then((result)=>{
//
//      res.send('')
//      knex(destroy);
//    })
//    .catch((err)=>{
//      console.log(err);
//      knex(destroy);
//      process.exit(1)
//    })

//
// })
//DELETE a book
// router.get('/books/:id', (req,res,next)=>{
//   const id = Number.parseInt(req.params.id)
//   //condition needed for id problems
//   //knex query builder
//   knex('books')
//    .delete('')
//    .where('id', id)
//    .then((result)=>{
//
//      //res.send('')
//      knex(destroy);
//    })
//    .catch((err)=>{
//      console.log(err);
//      knex(destroy);
//      process.exit(1)
//    })
// })






module.exports = router;
