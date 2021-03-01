const mongoose              = require('mongoose');
const Schema                = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const opts     = { toJSON: {virtuals: true}};




const ImageSchema = new Schema({
  url: String,
  filename: String
});

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  image: [ImageSchema],
  reviews: [
    {
      type: Schema.Types.ObjectId, 
      ref: 'Review'
    }
  ]
}, opts);

UserSchema.plugin(passportLocalMongoose);
//Plug in is going to add a user name to our Schema and 
// make sure it is unique, password, aditional methods etc...

ImageSchema.virtual('reviewProfilePic').get(function () {
  return this.url.replace('/upload', '/upload/c_scale,w_85,h_75');
});


module.exports = mongoose.model('User', UserSchema);