const Restaurant         = require('../models/restaurant');
const Review             = require('../models/review');

module.exports.createReview = async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id).populate('reviews').exec();
  const haveReviewed = restaurant.reviews.filter(review => {
    return review.author.equals(req.user._id);
  }).length;
  if(haveReviewed){
    req.flash('error', 'You already reviewed this restaurant!');
    return res.redirect(`/restaurants/${restaurant._id}`)
  }

  const review = new Review(req.body.review);
  review.author = req.user._id;
  restaurant.reviews.push(review);
  await review.save();
  await restaurant.save();
  req.flash('success', 'Successfully Added a Review')
  res.redirect(`/restaurants/${restaurant._id}`);
};

module.exports.deleteReview = async (req, res) =>{
  const {id, reviewId} = req.params;
  await Restaurant.findByIdAndUpdate(id, {$pull: {reviews: reviewId}})
  await Review.findByIdAndDelete(reviewId);
  req.flash('success', 'Successfully Deleted a Review')
  res.redirect(`/restaurants/${id}`);
};

//add UpdateReview

module.exports.updateReview = async (req, res) => {
  const {id, reviewId} = req.params;
  await Review.findByIdAndUpdate(reviewId, {...req.body.review});
  req.flash('success', 'Successfully Updated a Review')
  res.redirect(`/restaurants/${id}`);
};