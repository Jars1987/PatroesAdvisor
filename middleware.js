const {restaurantSchema,
       reviewSchema,
       userSchema}       = require('./schemas');
const ExpressError       = require('./utils/ExpressError');
const Restaurant         = require('./models/restaurant');
const Review             = require('./models/review');
const User               = require('./models/user');
const multer             = require('multer');
const { storage }        = require('./cloudinary');
const upload             = multer({
                          storage,
                          limits: { fileSize: 2500000, files: 6} 
                        });

module.exports.isLoggedIn = (req, res, next) => {
  if(!req.isAuthenticated()){
    req.session.returnTo = req.originalUrl;
    req.flash('error', 'You must be Sign in first!');
    return res.redirect('/login');
  }
  next();
}

module.exports.validateRestaurant = (req, res, next) => {
  const { error } = restaurantSchema.validate(req.body);
  console.log(req.body);
  if (error) {
      const msg = error.details.map(el => el.message).join(',')
      throw new ExpressError(msg, 400)
  } else {
      next();
  }
}

module.exports.isAuthor = async (req, res, next) => {
  const {id} = req.params;
  const restaurant = await Restaurant.findById(id);
  if(!restaurant.author.equals(req.user._id)){
    req.flash('error', 'You do not have permission to do that!');
    return res.redirect(`/restaurants/${id}`);
  }
  next()
}

module.exports.validateReview = (req, res, next) => {
  const {error} = reviewSchema.validate(req.body);
  if(error) {
    const msg = error.details.map(el => el.message).join('.')
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
}

module.exports.isReviewAuthor = async (req, res, next) => {
  const {id, reviewId} = req.params;
  const review = await Review.findById(reviewId);
  if(!review.author.equals(req.user._id)){
    req.flash('error', 'You do not have permission to do that!');
    return res.redirect(`/restaurants/${id}`);
  }
  next()
}

  
module.exports.uploadFile = (req, res, next) => {
  const uploadProcess = upload.array('image');
  uploadProcess(req, res, err => {
     if (err instanceof multer.MulterError) {
        return next(new Error(err, 500));
     } else if (err) {
        return next(new Error(err, 500));
     }
     next();
  });
};

module.exports.profilePicUpload = (req, res, next) => {
  const uploadProcess = upload.single('image');
  uploadProcess(req, res, err => {
     if (err instanceof multer.MulterError) {
        return next(new Error(err, 500));
     } else if (err) {
        return next(new Error(err, 500));
     }
     next();
  });
};

module.exports.isProfileOwner = async (req, res, next) => {
  const {id} = req.params;
  const userProfile = await User.findById(id);
  const userId      = req.user._id
  if(!userProfile._id.equals(userId)){
    req.flash('error', 'You are not the owner of the Profile you attempted to visit!');
    return res.redirect(`/profile/${userId}`);
  }
  next()
}

//using this to avoid uploafding the photo to Cloudinary if we rely on passport error handling
module.exports.checkIfUserExists = async (req, res, next) => {
  const emailExists = await User.find({email: req.body.email});
  const usernameExists = await User.find({username: req.body.username});
  if(usernameExists){
    req.flash('error', 'A user with the given username is already registered');
    return res.redirect('/register');
  } else if (emailExists) {
    req.flash('error', 'A user with the given email is already registered');
    return res.redirect('/register');
  } else {
    next();

  }
};

module.exports.isValidPassword = async (req, res, next) => {
  console.log(req.body)
  const { user } = await User.authenticate()(req.user.username, req.body.currentPassword);
  if(user) {
    res.local.user = user;
    next();
  } else {
    req.flash('error', 'Incorrect Current Password!')
    return res.redirect(`/profile/${req.user._id}`);
  }
};

module.exports.changePassword = async (req, res, next) => {
  const {
    newPassword,
    passwordConfirmation
  } = req.body;
  if(newPassword && !passwordConfirmation){
    req.flash('error', 'Missing Password Confirmation');
    return res.redirect(`/profile/${req.user._id}`)
  }
  if(newPassword && passwordConfirmation){
    const { user } = res.locals;
    if(newPassword === passwordConfirmation) {
      await user.setPassword(newPassword);
      next();
    } else {
      req.flash('error', 'New passwords must match!')
      return res.redirect(`/profile/${req.user._id}`);
    }
  } else {
    next()
  }
};