const Joi = require('Joi');

module.exports.restaurantSchema = Joi.object({
  restaurant: Joi.object({
    title:  Joi.string().required(),
    price: Joi.number().required().min(0),
    image: Joi.string().required(),
    location: Joi.string().required(),
    description: Joi.string().required()
  }).required()
});