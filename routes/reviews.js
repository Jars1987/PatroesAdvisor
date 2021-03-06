const express            = require('express');
const router             = express.Router({mergeParams: true});
const {isLoggedIn,
       isReviewAuthor,
       validateReview}   = require('../middleware');
const Restaurant         = require('../models/restaurant');
const Review             = require('../models/review');
const reviews            = require('../controllers/reviews');
const ExpressError       = require('../utils/ExpressError');
const catchAsync         = require('../utils/catchAsync');


router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.put('/:reviewId', isLoggedIn, catchAsync(isReviewAuthor), catchAsync(reviews.updateReview));

router.delete('/:reviewId', isLoggedIn, catchAsync(isReviewAuthor),catchAsync(reviews.deleteReview));


module.exports = router;