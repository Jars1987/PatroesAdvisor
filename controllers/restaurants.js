
const Restaurant         = require('../models/restaurant');
const mbxGeocoding       = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken        = process.env.MAPBOX_TOKEN;
const geocoder           = mbxGeocoding({accessToken: mapBoxToken});
const { cloudinary }     = require('../cloudinary');

module.exports.index = async (req, res) => {
  const {dbQuery} = res.locals;
  delete res.locals.dbQuery;
  const restaurants = await Restaurant.paginate(dbQuery, {
    page: req.query.page || 1,
    limit: 10,
    forceCountFn: true
    //force count is needed for $near on searchAndFilter middleware to work
    //but this makes depracation warning goes on.
    //mongoose sugest to swicht $near with $center but it does not recgnise in this middleware but mongoDB states $next is to be used in $geoWithin
  });
  restaurants.page = Number(restaurants.page);
  if(!restaurants.docs.length && res.locals.query){
    req.flash('error', 'No results match that query!');
    res.redirect('/restaurants');
  }
  const allRestaurants = await Restaurant.find();
  res.render('restaurants/index', {restaurants, allRestaurants, title: 'Restaurants Index'});
};

module.exports.renderNewForm = (req, res) => {
  res.render('restaurants/new', {title: 'New Restaurant'});
};

module.exports.createRestaurant = async (req, res, next) => {
  const geoData = await geocoder.forwardGeocode({
    query: req.body.restaurant.location,
    limit: 1
  }).send()
  if(!geoData.body.features[0]){
    for(let image of req.files){
      await cloudinary.uploader.destroy(image.filename);
    }
    req.flash('error', 'Please insert a valid location!');
    return res.redirect('/restaurants/new');
  }
  const restaurant = new Restaurant(req.body.restaurant);
  if(!restaurant){
    for(let image of req.files){
      await cloudinary.uploader.destroy(image.filename);
    }
    req.flash('error', 'Something went wrong!');
    return res.redirect('/restaurants/new');
  }
  if(req.files.length === 0 ){
    for(let image of req.files){
      await cloudinary.uploader.destroy(image.filename);
    }
    req.flash('error', 'In order to add a new Restaurant at least one image must be provided!');
    return res.redirect('/restaurants/new');
  }
  restaurant.geometry = geoData.body.features[0].geometry;
  restaurant.images = req.files.map(f => ({url: f.path, filename: f.filename}))
  restaurant.author = req.user._id;
  await restaurant.save();
  req.flash('success', 'Successfuly added a new Restaurant!');
  res.redirect(`/restaurants/${restaurant._id}`);
};

module.exports.showRestaurant = async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id)
  .populate({
            path: 'reviews',
            options: {sort: {'_id': -1}},
            populate: {
                path: 'author'
            }})
  .populate('author');
  if(!restaurant){
    req.flash('error', 'Cannot find that Restaurant');
    return res.redirect('/restaurants')
  }
  const floorRating = restaurant.calculateAvgRating();
  res.render('restaurants/show', {restaurant, floorRating, title: 'Show Page'});
};

module.exports.renderEditForm = async (req, res) => {
  const {id} = req.params;
  const restaurant = await Restaurant.findById(id);
  if(!restaurant){
    req.flash('error', 'Cannot find that Restaurant');
    return res.redirect('/restaurants')
  }
  res.render('restaurants/edit', {restaurant, title: 'Restaurants Update'});
};

module.exports.updateRestaurant = async (req, res) => {
  const {id} = req.params;
  const geoData = await geocoder.forwardGeocode({
    query: req.body.restaurant.location,
    limit: 1
  }).send()
  if(!geoData.body.features[0]){
    req.flash('error', 'Please insert a valid location!');
    res.redirect(`/restaurants/${id}/edit`);
  }
  const restaurant = await Restaurant.findByIdAndUpdate(id,{...req.body.restaurant});
  restaurant.geometry = geoData.body.features[0].geometry;
  const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));
  restaurant.images.push(...imgs);
  await restaurant.save();
  if(req.body.deleteImages){
    for(let filename of req.body.deleteImages){
      await cloudinary.uploader.destroy(filename);
    }
  await restaurant.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}});
  }
  req.flash('success', 'Successfully Updated Restaurant');
  res.redirect(`/restaurants/${restaurant._id}`);
};

module.exports.deleteRestaurant = async (req, res) => {
  const {id} = req.params;
  const restaurant = await Restaurant.findById(id);
  const imagesToDelete = restaurant.images;
  if(imagesToDelete){
    for(let file of imagesToDelete){
      await cloudinary.uploader.destroy(file.filename);
    }
  }
  await Restaurant.findByIdAndDelete(id);
  req.flash('success', 'Successfuly deleted a Restaurant');
  res.redirect('/restaurants');
};