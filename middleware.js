const {restaurantSchema,
       reviewSchema,
       }                 = require('./schemas');
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
const { cloudinary }     = require('./cloudinary');
const mbxGeocoding       = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken        = process.env.MAPBOX_TOKEN;
const geocodingClient    = mbxGeocoding({accessToken: mapBoxToken});

const deleteProfileImage = async (req) => {
	if (req.file) await cloudinary.uploader.destroy(req.file.filename);
};
const escapeRegExp = function (str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}


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
	console.log('emailExists:', emailExists);
  const usernameExists = await User.find({username: req.body.username});
	console.log('usernameExists', usernameExists);
  if(usernameExists.length){
		console.log('username error');
    req.flash('error', 'A user with the given username is already registered');
    return res.redirect('/register');
  } else if (emailExists.length) {
		console.log('email error');
    req.flash('error', 'A user with the given email is already registered');
    return res.redirect('/register');
  } else {
    next();

  }
};



module.exports.isValidPassword = async (req, res, next) => {
  const { user } = await User.authenticate()(req.user.username, req.body.currentPassword);
  if(user) {
    res.locals.user = user;
    next();
  } else {
    deleteProfileImage(req);
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
    deleteProfileImage(req);
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

module.exports.searchAndFilterRestaurants = async (req, res, next) => {
	// pull keys from req.query (if there are any) and assign them 
	// to queryKeys variable as an array of string values
	const queryKeys = Object.keys(req.query);
	/* 
		check if queryKeys array has any values in it
		if true then we know that req.query has properties
		which means the user:
		a) clicked a paginate button (page number)
		b) submitted the search/filter form
		c) both a and b
	*/
	if (queryKeys.length) {
		// initialize an empty array to store our db queries (objects) in
		const dbQueries = [];
		// destructure all potential properties from req.query
		let { search, price, location, distance  } = req.query;
		// check if search exists, if it does then we know that the user
		// submitted the search/filter form with a search query
		if (search) {
			// convert search to a regular expression and 
			// escape any special characters
			search = new RegExp(escapeRegExp(search), 'gi');
			// create a db query object and push it into the dbQueries array
			// now the database will know to search the title, description, and location
			// fields, using the search regular expression
			dbQueries.push({ $or: [
				{ title: search },
				{ description: search },
				{ location: search },
        { foodType: search },
        { specialDish: search }
			]});
		}
		// check if location exists, if it does then we know that the user
		// submitted the search/filter form with a location query
		if (location) {
			let coordinates;
			try {
				if(typeof JSON.parse(location) === 'number') {
					throw new Error;
				}
				//parse Location and added to Coordinates
				location = JSON.parse(location);
				coordinates = location;
			} catch(err) {
				const response = await geocodingClient
					.forwardGeocode({
						query: location,
						limit: 1
					})
					.send();
				coordinates = response.body.features[0].geometry.coordinates;
			}

			let maxDistance = distance || 10;
			// we need to convert the distance to meters, one mile is approximately 1609.34 meters, 1km is 1000 meters
			maxDistance *= 1000;
			// create a db query object for proximity searching via location (geometry)
			// and push it into the dbQueries array
			dbQueries.push({
			  geometry: {
			    $near: {
			      $geometry: {
			        type: 'Point',
			        coordinates
			      },
			      $maxDistance: maxDistance
			    }
			  }
			});
		}
		// check if price exists, if it does then we know that the user
		// submitted the search/filter form with a price query (min, max, or both)
		if (price) {
			/*
				check individual min/max values and create a db query object for each
				then push the object into the dbQueries array
				min will search for all post documents with price
				greater than or equal to ($gte) the min value
				max will search for all post documents with price
				less than or equal to ($lte) the min value
			*/
			if (price.min) dbQueries.push({ price: { $gte: price.min } });
			if (price.max) dbQueries.push({ price: { $lte: price.max } });
		}

		// pass database query to next middleware in route's middleware chain
		// which is the postIndex method from /controllers/postsController.js
		res.locals.dbQuery = dbQueries.length ? { $and: dbQueries } : {};
	}
	// pass req.query to the view as a local variable to be used in the searchAndFilter.ejs partial
	// this allows us to maintain the state of the searchAndFilter form
	res.locals.query = req.query;

	// build the paginateUrl for paginatePosts partial
	// first remove 'page' string value from queryKeys array, if it exists
	queryKeys.splice(queryKeys.indexOf('page'), 1);
	/*
		now check if queryKeys has any other values, if it does then we know the user submitted the search/filter form
		if it doesn't then they are on /posts or a specific page from /posts, e.g., /posts?page=2
		we assign the delimiter based on whether or not the user submitted the search/filter form
		e.g., if they submitted the search/filter form then we want page=N to come at the end of the query string
		e.g., /posts?search=surfboard&page=N
		but if they didn't submit the search/filter form then we want it to be the first (and only) value in the query string,
		which would mean it needs a ? delimiter/prefix
		e.g., /posts?page=N
		*N represents a whole number greater than 0, e.g., 1
	*/
	const delimiter = queryKeys.length ? '&' : '?';
	// build the paginateUrl local variable to be used in the paginatePosts.ejs partial
	// do this by taking the originalUrl and replacing any match of ?page=N or &page=N with an empty string
	// then append the proper delimiter and page= to the end
	// the actual page number gets assigned in the paginatePosts.ejs partial
	res.locals.paginateUrl = req.originalUrl.replace(/(\?|\&)page=\d+/g, '') + `${delimiter}page=`;
	// move to the next middleware (postIndex method)
	next();
}

