const User        = require('../models/user');
const Restaurants = require('../models/restaurant');
const util        = require('util');

module.exports.renderSignUpForm = (req, res) => {
  res.render('users/register');
};

module.exports.createNewUser = async (req, res) => {
  try {
    const {email, username, password} = req.body;
    const user = new User({email, username});
    const registeredUser= await User.register(user, password);
    if(req.file.length === 0 ){
      req.flash('error', 'In order to Sign Up a User a Profile picture must be provided!');
      return res.redirect('/restaurants/new');
    }
    registeredUser.image = {url: req.file.path, filename: req.file.filename};
    await registeredUser.save()
    req.login(registeredUser, err => {
      if(err) return next(err);
      req.flash('success', 'Welcome to Patrões Advisor')
      res.redirect('/restaurants');
    });
  } catch (e) {
    let error = e.message;
    if(error.includes('duplicate') && error.includes('index: email_1 dup key')){
      error = 'A user with the given email is already registered';
    } 
    req.flash('error', error);
    res.redirect('/register');
  }
};

module.exports.renderLogin = (req, res) => {
  if(req.isAuthenticated()) return res.redirect('/restaurants');
  res.render('users/login');
};

module.exports.loginUser = (req, res) => {
  req.flash('success', 'Welcome back!');
  const redirectUrl = req.session.returnTo || '/restaurants';
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};

module.exports.logoutUser = (req, res) => {
  req.logout();
  req.flash('success', 'Successfuly loged out. Goodbye!')
  res.redirect('/restaurants');
};

module.exports.profile = async (req, res) => {
  try {
    const restaurants = await Restaurants.find({author: req.user._id});
    // different metohd to obtain a limit amount restaurants:
    //const restaurants = await Restaurants.find().where('author).equals(req.user._id).limit(10).exec()
    res.render('users/profile', {restaurants});
  } catch (error) {
    req.flash('error', 'User not found. Please Login!');
    return res.redirect('/login');
  }
};

module.exports.updateProfile = async (req, res, next) => {
  const {email, username} = req.body;
  const {user}            = res.locals;
  const checkUser         = await User.find({username});

  if((checkUser && checkUser.username !== req.user.username)){ 
  req.flash('error', 'Username already exists');
  res.redirect(`/profile/${req.params.id}`); 
  } else {
    if(username) user.username = username;
    if(email)    user.email = email;
    await user.save();
    const login = util.promisify(req.login.bind(req));
    await login(user);
    req.flash('success', 'Profile Successfully Updated');
    res.redirect(`/profile/${req.params.id}`);
  }};

