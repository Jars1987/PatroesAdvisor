const express    = require('express');
const router     = express.Router();
const catchAsync = require('../utils/catchAsync');
// use {} to avoir using users.obj
const users      = require('../controllers/users');
const passport   = require('passport');
const {
      checkIfUserExists,
      profilePicUpload,
      isLoggedIn,
      isProfileOwner,
      isValidPassword,
      changePassword,
    }             = require('../middleware');


router.route('/register')
  .get(users.renderSignUpForm)
  .post(catchAsync(checkIfUserExists), profilePicUpload, catchAsync(users.createNewUser));

router.route('/login')
  .get(users.renderLogin)
  .post(passport.authenticate('local', {failureFlash: true, failureRedirect: '/login' }), users.loginUser);

router.get('/logout', users.logoutUser);

//New Route and new functionality

router.route('/profile/:id')
  .get(isLoggedIn, catchAsync(isProfileOwner), users.profile)
  .put(isLoggedIn, profilePicUpload, catchAsync(isValidPassword), catchAsync(changePassword), catchAsync(users.updateProfile));

 router.route('/forgot-password')
  .get(users.forgotPw)
  .put(catchAsync(users.putForgotPw));

 router.route('/reset/:token')
  .get(catchAsync(users.getReset))
  .put(catchAsync(users.putReset));

module.exports = router;