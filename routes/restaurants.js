const express            = require('express');
const router             = express.Router();
const {restaurantSchema} = require('../schemas');
const catchAsync         = require('../utils/catchAsync');
const ExpressError       = require('../utils/ExpressError');
const Restaurant         = require('../models/restaurant');

const validateRestaurant = (req, res, next) => {
  const {error} = restaurantSchema.validate(req.body);
  if(error) {
    const msg = error.details.map(el => el.message).join('.')
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
}

router.get('/', catchAsync(async (req, res) => {
  const restaurants = await Restaurant.find({});
  res.render('restaurants/index', {restaurants});
}));

router.get('/new', (req, res) => {
  res.render('restaurants/new');
});

router.post('/', validateRestaurant, catchAsync(async (req, res, next) => {
  //if(!req.body.restaurant) throw new ExpressError('Invalid Campground Data', 400)
  const restaurant = new Restaurant(req.body.restaurant);
  await restaurant.save();
  req.flash('success', 'Successfuly added a new Restaurant!');
  res.redirect(`/restaurants/${restaurant._id}`);
}));

router.get('/:id', catchAsync(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id).populate('reviews');
  if(!restaurant){
    req.flash('error', 'Cannot find that Restaurant');
    return res.redirect('/restaurants')
  }
  res.render('restaurants/show', {restaurant});
}));

router.get('/:id/edit', catchAsync(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);
  if(!restaurant){
    req.flash('error', 'Cannot find that Restaurant');
    return res.redirect('/restaurants')
  }
  res.render('restaurants/edit', {restaurant});
}));

router.put('/:id', validateRestaurant, catchAsync(async (req, res) => {
  const {id} = req.params;
  const restaurant = await Restaurant.findByIdAndUpdate(id,{...req.body.restaurant});
  req.flash('success', 'Successfully Updated Restaurant');
  res.redirect(`/restaurants/${restaurant._id}`);
}));

router.delete('/:id', catchAsync(async (req, res) => {
  const {id} = req.params;
  await Restaurant.findByIdAndDelete(id);
  res.redirect('/restaurants');
}));

module.exports = router;