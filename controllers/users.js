const User       = require('../models/user');

module.exports.renderSignUpForm = (req, res) => {
  res.render('users/register');
};

module.exports.createNewUser = async (req, res) => {
  try {
    const {email, username, password} = req.body;
    const user = new User({email, username});
    const registeredUser= await User.register(user, password);
    req.login(registeredUser, err => {
      if(err) return next(err);
      req.flash('success', 'Welcome to Patrões Advisor')
      res.redirect('/restaurants');
    });
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('/register')
  }
};

module.exports.renderLogin = (req, res) => {
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