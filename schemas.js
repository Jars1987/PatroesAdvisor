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
//Need image validation! client side with ian
//need to check if of total images is over 6 and if is let let the consumer know

module.exports.restaurantSchema = Joi.object({
  restaurant: Joi.object({
    title:  Joi.string().required().escapeHTML(),
    price: Joi.number().required().min(0),
    //images: Joi.array().items()required(),
    location: Joi.string().required().escapeHTML(),
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

//Need to do usersSchema to valdiate users


