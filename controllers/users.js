const User        = require('../models/user');
const Restaurants = require('../models/restaurant');
const { cloudinary } = require('../cloudinary');
const util        = require('util');
const crypto      = require('crypto');
const sgMail      = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRIP_API_KEY);

module.exports.renderSignUpForm = (req, res) => {
  res.render('users/register', {title: 'User Signup'});
};

module.exports.createNewUser = async (req, res) => {
  try {
    const {email, username, password} = req.body;
    const user = new User({email, username});
    const registeredUser= await User.register(user, password);
    console.log(registeredUser);
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
  res.render('users/login', {title: 'User Login'});
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
    res.render('users/profile', {restaurants, title: 'User Profile'});
  } catch (error) {
    req.flash('error', 'User not found. Please Login!');
    return res.redirect('/login');
  }
};

module.exports.updateProfile = async (req, res, next) => {
  const {email, username} = req.body;
  const {user}            = res.locals;
  console.log(user.image[0].filename);
  const checkUser         = await User.find({username});
  if(checkUser.length > 0 && checkUser[0].username !== req.user.username){ 
    req.flash('error', 'Username already exists');
    return res.redirect(`/profile/${req.params.id}`); 
  } 
    try{
      if(username) user.username = username;
      if(email)    user.email = email;
      if (req.file) {
        if (user.image[0].filename) await cloudinary.uploader.destroy(user.image[0].filename);
        user.image = {url: req.file.path, filename: req.file.filename};
      }
      await user.save();
      const login = util.promisify(req.login.bind(req));
      await login(user);
      req.flash('success', 'Profile Successfully Updated');
      res.redirect(`/profile/${req.params.id}`);
    } catch (e) {
      let error = e.message;
      if(error.includes('duplicate') && error.includes('index: email_1 dup key')){
        error = 'A user with the given email is already registered';
      } 
      req.flash('error', error);
      res.redirect(`/profile/${req.params.id}`);
    }
  };

  module.exports.forgotPw = (req, res, next) => {
    res.render('users/forgot', {title: 'User Forgot Password'});
  };

  module.exports.putForgotPw = async (req, res, next) => {
    const token = await crypto.randomBytes(20).toString('hex');
    const user = await User.findOne({email: req.body.email});
    if(!user){
      req.flash('error', 'No Account exists for this email address');
      return res.redirect('/forgot-password');
    }
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 900000;
    await user.save();

    const msg = {
     to: user.email,
     from: 'Patroes Advisor Admin <patroesadvisorapp@gmail.com>', // Use the email address or domain you verified above
     subject: 'Patroes Advisor - Forgot Password / Reset',
     text: `You are receiving this because you (or someone else) 
     have requested the reset of the password for your account.
     Please click on the following link, or copy and paste it 
     into your browser to complete the process:
     http://${req.headers.host}/reset/${token}
     If you did not request this, please ignore this email
     and your password will remain unchanged.`.replace(/     /g, ''),
    }
    await sgMail.send(msg);
    req.flash('success', `An e-mail has been sent to ${user.email} with further instructions.`);
    res.redirect('/forgot-password')
  };

  module.exports.getReset = async (req, res, next) => {
    const { token } = req.params;
	  const user = await User.findOne({ 
      resetPasswordToken: token, 
      resetPasswordExpires: { $gt: Date.now() } 
    })
   if (!user) {
     req.flash('error', 'Password reset token is invalid or has expired.');
     return res.redirect('/forgot-password');
    }
    res.render('users/reset', { token, title: 'User Reset' });
    };

  module.exports.putReset = async (req, res, next) => {
    const { token } = req.params;
	  const user = await User.findOne({ 
      resetPasswordToken: token, 
      resetPasswordExpires: { $gt: Date.now() } 
    });
  	if (!user) {
  	 req.session.error = 'Password reset token is invalid or has expired.';
  	 return res.redirect(`/reset/${ token }`);
  	}
  	if(req.body.password === req.body.confirm) {
	  	await user.setPassword(req.body.password);
		  user.resetPasswordToken = null;
		  user.resetPasswordExpires = null;
		  await user.save();
		  const login = util.promisify(req.login.bind(req));
		  await login(user);
	  } else {
		  req.flash('error', 'Passwords do not match.');
		  return res.redirect(`/reset/${ token }`);
	  }

    const msg = {
      to: user.email,
      from: 'Patroes Advisor Admin <patroesadvisorapp@gmail.com>',
      subject: 'Patroes Advisor - Password Changed',
      text: `Hello,
	  	This email is to confirm that the password for your account has just been changed.
	  	If you did not make this change, please hit reply and notify us at once.`.replace(/	  	/g, '')
  };
  
  await sgMail.send(msg);

  req.flash('success', 'Password successfully updated!');
  res.redirect('/');
  };


  

