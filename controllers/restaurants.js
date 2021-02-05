
const Restaurant         = require('../models/restaurant');


module.exports.index = async (req, res) => {
  const restaurants = await Restaurant.find({});
  res.render('restaurants/index', {restaurants});
};

module.exports.renderNewForm = (req, res) => {
  res.render('restaurants/new');
};

module.exports.createRestaurant = async (req, res, next) => {
  const restaurant = new Restaurant(req.body.restaurant);
  restaurant.author = req.user._id;
  await restaurant.save();
  req.flash('success', 'Successfuly added a new Restaurant!');
  res.redirect(`/restaurants/${restaurant._id}`);
};

module.exports.showRestaurant = async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id)
  .populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }})
  .populate('author');
  if(!restaurant){
    req.flash('error', 'Cannot find that Restaurant');
    return res.redirect('/restaurants')
  }
  res.render('restaurants/show', {restaurant});
};

module.exports.renderEditForm = async (req, res) => {
  const {id} = req.params;
  const restaurant = await Restaurant.findById(id);
  if(!restaurant){
    req.flash('error', 'Cannot find that Restaurant');
    return res.redirect('/restaurants')
  }
  res.render('restaurants/edit', {restaurant});
};

module.exports.updateRestaurant = async (req, res) => {
  const {id} = req.params;
  const restaurant = await Restaurant.findByIdAndUpdate(id,{...req.body.restaurant});
  req.flash('success', 'Successfully Updated Restaurant');
  res.redirect(`/restaurants/${restaurant._id}`);
};

module.exports.deleteRestaurant = async (req, res) => {
  const {id} = req.params;
  await Restaurant.findByIdAndDelete(id);
  req.flash('success', 'Successfuly deleted a Restaurant');
  res.redirect('/restaurants');
};