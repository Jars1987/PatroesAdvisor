const express            = require('express');
const router             = express.Router();
const restaurants        = require('../controllers/restaurants');
const catchAsync         = require('../utils/catchAsync');
const {isLoggedIn,
       isAuthor,
       validateRestaurant,
       uploadFile
               }           = require('../middleware');

router.route('/')
       .get(catchAsync(restaurants.index))
       .post(isLoggedIn, uploadFile, validateRestaurant, catchAsync(restaurants.createRestaurant))

router.get('/new', isLoggedIn, restaurants.renderNewForm)

router.route('/:id')
       .get(catchAsync(restaurants.showRestaurant))
       .put(isLoggedIn, isAuthor, uploadFile, validateRestaurant, catchAsync(restaurants.updateRestaurant))
       .delete(isLoggedIn, isAuthor,catchAsync(restaurants.deleteRestaurant))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(restaurants.renderEditForm))


module.exports = router;