'use strict';
const boom = require('boom')
const express = require('express');
const jwt = require('jsonwebtoken')
const knex = require('../knex')
const {
  camelizeKeys,
  decamelizeKeys
} = require('humps');

// eslint-disable-next-line new-cap
const router = express.Router();
//authorize looks at request cookies.token and comapares to what is in process.env
//https://medium.com/vandium-software/5-easy-steps-to-understanding-json-web-tokens-jwt-1164c0adfcec
//https://scotch.io/tutorials/the-anatomy-of-a-json-web-token
const authorize = function(req, res, next) {
  //jwt.verify(token, secretOrPublicKey, [options, callback])
  jwt.verify(req.cookies.token, process.env.JWT_KEY, (err, payload) => {

    console.log(':::::::::::::::::::::::::::::::::::::::::::::::::::::::');
    console.log(req.cookies.token);
    if (err) {
      return next(boom.create(401, "Unauthorized"));
    }
    req.claim = payload;
    next();
  });
};

// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

//ROUTER GET '/favorites' and use authorize

router.get('/favorites', authorize, (req, res, next) => {

  //   console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
  // console.log(req.body);
  // console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
  knex('favorites')
    //use table books to do innerjoin with favorites.book_id and books.id (i.e. only select those items in books table that have an id in favorites)
    .innerJoin('books', 'books.id', 'favorites.book_id')
    //check for match betwee favorites.user_id and the userId in request
    .where('favorites.user_id', req.claim.userId)
    //ASC = ascending
    //write 1000 times "I will never spell Id with a capital D..."
    .orderBy('books.title', 'ASC')
    .then((rows) => {
      const favs = camelizeKeys(rows);
      console.log(favs);
      res.send(favs);
    })
    .catch((err) => {
      next(err);
    })
})

//ROUTER GET '/favorites/check'

router.get('/favorites/check', authorize, (req, res, next) => {

  console.log('JWTJWTJWTJWTJWTJWTJWTJWTJWTJWTJWTJWTJWTJWTJWT');
  console.log(req.claim);
  //looks like this: { userId: 1, iat: 1509233968, exp: 1509838768 }
  //claim is a property from JWT. iat = issued at:


  const bookId = Number.parseInt(req.query.bookId);
  if (!Number.isInteger(bookId)) {
    return next(boom.create(400, 'Book ID must be an integer'))
  }
  knex('books')
    .innerJoin('favorites', 'favorites.book_id', 'books.id')
    .where({
      'favorites.book_id': bookId,
      'favorites.user_id': req.claim.userId
    })
    .first()
    .then((row) => {
      if (row) {
        return res.send(true);
      }
      res.send(false);
    })
    .catch((err) => {
      next(err);
    })
})

//ROUTER POST '/favorites' and authorize
router.post('/favorites', authorize, (req, res, next) => {
  //check that given bookid is a number
  const bookId = Number.parseInt(req.body.bookId);
  if (!Number.isInteger(bookId)) {
    return next(boom.create(400, 'Book Id must be an integer'))
  }
  knex('books')
    .where('id', bookId)
    .first()
    .then((book) => {
      //if sql query in books table does not return a value then err
      if (!book) {
        throw boom.create(404, 'book not found')
      }
      //else {insert that books userId into favorites but decamelize to get correct format}
      const insertFav = {
        bookId,
        userId: req.claim.userId
      };
      return knex('favorites')
        .insert(decamelizeKeys(insertFav), '*')

    })
    .then((rows) => {
      //then send the row as fav
      const fav = camelizeKeys(rows[0])
      res.send(fav)
    })
    .catch((err) => {
      next(err)
    })
})

//ROUTER DELETE '/favorites and authorize
router.delete('/favorites', authorize, (req, res, next) => {
  const bookId = Number.parseInt(req.body.bookId);
  //check if id in req is actually a book id
  if (!Number.isInteger(bookId)) {
    return next(boom.create(400, 'Book Id must be an integer'))
  }
  console.log({
    book_id: bookId,
    user_id: req.claim.userId
  });
  const what = {
    book_id: bookId,
    user_id: req.claim.userId
  };

  let deleteThis;
  knex('favorites')
    .where(what)
    .first()
    .then((row) => {
      if (!row) {
        throw boom.create(404, 'Favorite not found');
      }
      deleteThis = camelizeKeys(row);
      return knex('favorites')
        .del()
        .where('id', deleteThis.id)
    })
    .then(() => {
      delete deleteThis.id;
      res.send(deleteThis)
    })
    .catch((err) => {
      next(err);
    });
})
module.exports = router;
