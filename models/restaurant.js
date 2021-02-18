const mongoose = require('mongoose');
const Review   = require('./review');
const Schema   = mongoose.Schema;
const opts     = { toJSON: {virtuals: true}};



const ImageSchema = new Schema({
    url: String,
    filename: String
});

//Now we can set up a virtual and this way we avoid storing this on our model DB
//it will looked it is stored but in fact is calling virtual everytime
ImageSchema.virtual('thumbnail').get(function () {
  return this.url.replace('/upload', '/upload/c_scale,w_200,h_140');
});

const RestaurantSchema = new Schema({
  title: String,
  images: [ImageSchema],
  geometry: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  price: Number,
  description: String,
  location: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviews: [
    {
      type: Schema.Types.ObjectId, 
      ref: 'Review'
    }
  ]
}, opts);



RestaurantSchema.virtual('properties.popUpMarkup').get(function () {
    return `<a href="/restaurants/${this._id}" >${this.title}</a>
            <p>${this.description.substring(0, 50)}...</p>`;
});

RestaurantSchema.post('findOneAndDelete', async function (doc) {
  if(doc){
    await Review.deleteMany({
      _id: {
        $in: doc.reviews
      }
    })
  }
});




module.exports = mongoose.model('Restaurant', RestaurantSchema);



