const express            = require('express');
const router             = express.Router({mergeParams: true});
const reviews            = require('../controllers/reviews');
const {isLoggedIn,
       isReviewAuthor,
       validateReview}   = require('../middleware');
const Restaurant         = require('../models/restaurant');
const Review             = require('../models/review');
const catchAsync         = require('../utils/catchAsync');


router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor,catchAsync(reviews.deleteReview));

module.exports = router;