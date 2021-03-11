const sanitizeHTML = require('sanitize-html');
const BaseJoi = require('Joi');

//this extension needs package sanitize-html
const extension = (joi) => ({
  type: 'string',
  base: joi.string(),
  messages: {
    'string.escapeHTML': '{{#label}} must not include HTML'
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        const clean = sanitizeHTML(value, {
          allowedTags: [],
          allowedAttributes: {},
        });
        if (clean !== value) return helpers.error('string.escapeHTML', {value})
        return clean
      }
    }
  }
});

const Joi = BaseJoi.extend(extension);


module.exports.restaurantSchema = Joi.object({
  restaurant: Joi.object({
    title:  Joi.string().required().escapeHTML(),
    price: Joi.number().required().min(0),
    //images: Joi.array().items()required(),
    location: Joi.string().required().escapeHTML(),
    foodType: Joi.string().escapeHTML(),
    specialDish: Joi.string().escapeHTML(),
    description: Joi.string().required().escapeHTML()
  }).required(),
    deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    body: Joi.string().required().escapeHTML()
  }).required()
});

/*module.exports.userSchema = Joi.object({
  user: Joi.object({
    username: Joi.string().escapeHTML(),
    email: Joi.string().email().required().escapeHTML()
  }).required()
});*/
