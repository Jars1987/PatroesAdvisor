const express            = require('express');
const router             = express.Router();
const restaurants        = require('../controllers/restaurants');
const catchAsync         = require('../utils/catchAsync');
const {isLoggedIn,
       isAuthor,
       validateRestaurant,
       uploadFile,
       searchAndFilterRestaurants
               }           = require('../middleware');

router.route('/')
       .get(catchAsync(searchAndFilterRestaurants), catchAsync(restaurants.index))
       .post(isLoggedIn, uploadFile, validateRestaurant, catchAsync(restaurants.createRestaurant))

router.get('/new', isLoggedIn, restaurants.renderNewForm)

router.route('/:id')
       .get(catchAsync(restaurants.showRestaurant))
       .put(isLoggedIn, catchAsync(isAuthor), uploadFile, validateRestaurant, catchAsync(restaurants.updateRestaurant))
       .delete(isLoggedIn, catchAsync(isAuthor),catchAsync(restaurants.deleteRestaurant))

router.get('/:id/edit', isLoggedIn, catchAsync(isAuthor), catchAsync(restaurants.renderEditForm))


module.exports = router;