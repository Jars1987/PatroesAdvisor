const express    = require('express');
const router     = express.Router();
const catchAsync = require('../utils/catchAsync');
const users      = require('../controllers/users');
const passport   = require('passport');
const { response } = require('express');

router.route('/register')
  .get(users.renderSignUpForm)
  .post(catchAsync(users.createNewUser));

router.route('/login')
  .get(users.renderLogin)
  .post(passport.authenticate('local', {failureFlash: true, failureRedirect: '/login' }), users.loginUser);

router.get('/logout', users.logoutUser);

//New Route and new functionality

router.route('/profile/:id')
 .get(users.profile)
 .put(users.editProfile);

 router.get('/forgot', (req, res) =>{
  res.send('Get Password Page');
 });

 router.put('/forgot', (req, res) =>{
  res.send('Put Password Page');
 });

 router.get('/reset', (req, res) =>{
  res.send('/Get /reset/:token');
 });
 router.put('/reset', (req, res) =>{
  res.send('/Get /reset/:token');
 });

module.exports = router;