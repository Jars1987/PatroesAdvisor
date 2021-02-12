const Joi = require('Joi');
const number = require('joi');

//Need image validation! client side with ian
//need to check if of total images is over 6 and if is let let the consumer know

module.exports.restaurantSchema = Joi.object({
  restaurant: Joi.object({
    title:  Joi.string().required(),
    price: Joi.number().required().min(0),
    //images: Joi.array().items()required(),
    location: Joi.string().required(),
    description: Joi.string().required()
  }).required(),
    deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    body: Joi.string().required()
  }).required()
});



