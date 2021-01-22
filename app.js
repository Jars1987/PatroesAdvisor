const express            = require('express');
const path               = require('path');
const mongoose           = require('mongoose');
const ejsMate            = require('ejs-mate');
const {restaurantSchema} = require('./schemas');
const catchAsync         = require('./utils/catchAsync');
const ExpressError       = require('./utils/ExpressError');
const methodOverride     = require('method-override');
const Restaurant         = require('./models/restaurant');


mongoose.connect('mongodb://localhost:27017/patroes-advisor', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected');
});

const app      = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

const validateRestaurant = (req, res, next) => {
  const {error} = restaurantSchema.validate(req.body);
  if(error) {
    const msg = error.details.map(el => el.message).join('.')
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
}


app.get('/', (req, res) =>{
  res.render('home');
});

app.get('/restaurants', catchAsync(async (req, res) => {
  const restaurants = await Restaurant.find({});
  res.render('restaurants/index', {restaurants});
}));

app.get('/restaurants/new', (req, res) => {
  res.render('restaurants/new');
});

app.post('/restaurants', validateRestaurant, catchAsync(async (req, res, next) => {
  //if(!req.body.restaurant) throw new ExpressError('Invalid Campground Data', 400)

  const restaurant = new Restaurant(req.body.restaurant);
  await restaurant.save();
  res.redirect(`/restaurants/${restaurant._id}`);
}));

app.get('/restaurants/:id', catchAsync(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);
  res.render('restaurants/show', {restaurant});
}));

app.get('/restaurants/:id/edit', catchAsync(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);
  res.render('restaurants/edit', {restaurant});
}));

app.put('/restaurants/:id', validateRestaurant, catchAsync(async (req, res) => {
  const {id} = req.params;
  const restaurant = await Restaurant.findByIdAndUpdate(id,{...req.body.restaurant});
  res.redirect(`/restaurants/${restaurant._id}`);
}));

app.delete('/restaurants/:id', catchAsync(async (req,res) => {
  const {id} = req.params;
  await Restaurant.findByIdAndDelete(id);
  res.redirect('/restaurants');
}));

app.all('*', (req, res, next) => {
  next(new ExpressError('Page not found', 404));
});

app.use((err, req, res, next) => {
  const {statusCode = 500} = err;
  if(!err.message) err.message = 'Oh No, Something Went Wrong!';
  res.status(statusCode).render('error', {err});
});

app.listen( 3000, () => {
  console.log('Server is running!')
});