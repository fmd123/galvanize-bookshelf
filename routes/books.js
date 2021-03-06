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
      //console.log(book);
      res.json(book);
      //Can use res.json INSTEAD OF:
      //res.setHeader('Content-Type', 'application/json')
      //res.send(JSON.stringify(items))
      // knex.destroy();
    })
    .catch((err) => {
      next(err)
    })
})

//CREATE A book (Insert)
router.post('/books', (req,res,next)=>{
  const {title, author, genre, description, coverUrl} = req.body;
  console.log({title, author, genre, description, coverUrl});
  //convert into an object
  //conditions needed for input problems for each key of object
  if(!title||!title.trim()){
    return res.sendStatus(404)
  }
  if(!author||!author.trim()){
    return res.sendStatus(404)
  }
  if(!genre||!genre.trim()){
    return res.sendStatus(404)
  }

  if(!description||!description.trim()){
    return res.sendStatus(404)
  }
  if(!coverUrl||!coverUrl.trim()){
    return res.sendStatus(404)
  }
  const newBook = {title, author, genre, description, coverUrl};
  //console.log("NEWBOOK" + newBook);
  //knex query builder
  knex('books')
   .insert(decamelizeKeys(newBook), '*')
   .then((result)=>{
     const latestBook = camelizeKeys(result[0])
     res.json(latestBook)
    //  knex.destroy();
   })
   .catch((err) => {
     next(err)
   })

})


//UPDATE a book's table entry
router.patch('/books/:id', (req,res,next)=>{
  const id = Number.parseInt(req.params.id)

  //condition needed for id problems
  if(Number.isNaN(id)){
    return res.sendStatus(404)
  }
  //knex query builder
  knex('books')
   .where('id', id)
   .first()
   .then((result)=>{
     if(!result){
       return res.sendStatus(404)
     }
     const {title, author, genre, description, coverUrl} = req.body;

     const revisedBookArr = {}
     //empty array to get the values from req.body
     //one by one...
     if (title){
       revisedBookArr.title = title
     }
     if (author){
       revisedBookArr.author = author
     }
     if (genre){
       revisedBookArr.genre = genre
     }
     if (description){
       revisedBookArr.description = description
     }
     if (coverUrl){
       revisedBookArr.coverUrl = coverUrl
     }
     //console.log('REVISEDBOOKARR ' + revisedBookArr);
     return knex('books')
      .update(decamelizeKeys(revisedBookArr), '*')
      .where('id', id)
   })
   .then((result)=>{
     const revisedBook = camelizeKeys(result[0])
     res.json(revisedBook)
   })
   .catch((err) => {
     next(err)
   })


})
//DELETE a book
router.delete('/books/:id', (req,res,next)=>{
  const id = Number.parseInt(req.params.id)
  console.log('ID ID ID ID ID' + id);
  //condition needed for id problems
  if(Number.isNaN(id)){
    return res.sendStatus(404)
  }
  //knex query builder
  let banned;
  //out here so it gets reset
  knex('books')
   .where('id', id)
   .first()
   .then((result)=>{
     if(!result){
       return res.sendStatus(404)
     }
     banned = camelizeKeys(result)

     return knex('books')
      .del()
      .where('id', id)
   })
   .then(()=>{
     delete banned.id;
     res.json(banned)
   })
   .catch((err)=>{
     console.log(err);
     knex(destroy);
     process.exit(1)
   })
})






module.exports = router;
