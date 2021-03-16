const mongoose         = require('mongoose');
const Review           = require('./review');
const mongoosePaginate = require('mongoose-paginate-v2')
const Schema           = mongoose.Schema;
const opts             = { toJSON: {virtuals: true}, timestamps: { createdAt: 'created_at' }};



const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
  return this.url.replace('/upload', '/upload/c_scale,w_200,h_140');
});

ImageSchema.virtual('thumbnailMap').get(function () {
  return this.url.replace('/upload', '/upload/c_scale,w_100,h_75');
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
  foodType: String,
  specialDish: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviews: [
    {
      type: Schema.Types.ObjectId, 
      ref: 'Review'
    }
  ],
  avgRating: {type: Number, default: 0}
}, opts);



RestaurantSchema.virtual('properties.popUpMarkup').get(function () {
    return `<a href="/restaurants/${this._id}" >${this.title}</a><br>
            <img src="${this.images[0].thumbnailMap}" alt="">
            <p>${this.description.substring(0, 50)}...</p>`;
});

RestaurantSchema.virtual('dateEdited').get(function () {
  const updatedDate = new Date(this.updatedAt);
  return updatedDate.toLocaleDateString();
});

RestaurantSchema.virtual('dateCreated').get(function () {
  const createdDate = new Date(this.created_at);
  return createdDate.toLocaleDateString();
});

//Mongoose Midleware to delete reviews associated with a deleted Restaurant
RestaurantSchema.post('findOneAndDelete', async function (doc) {
  if(doc){
    await Review.deleteMany({
      _id: {
        $in: doc.reviews
      }
    })
  }
});

RestaurantSchema.methods.calculateAvgRating = function () {
  let ratingsTotal = 0;
  if(this.reviews.length){
    this.reviews.forEach(review => {
      ratingsTotal += review.rating;
    });
    this.avgRating = Math.round((ratingsTotal / this.reviews.length) * 10) / 10;
  } else {
    this.avgRating = ratingsTotal;
  }
  const floorRating = Math.floor(this.avgRating);
  this.save();
  return floorRating;
};

RestaurantSchema.plugin(mongoosePaginate);

RestaurantSchema.index({ geometry: '2dsphere' });

module.exports = mongoose.model('Restaurant', RestaurantSchema);



