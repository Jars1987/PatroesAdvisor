const mongoose              = require('mongoose');
const Schema                = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  }
});

UserSchema.plugin(passportLocalMongoose);
//Plug in is going to add a user name to our Schema and 
// make sure it is unique, password, aditional methods etc...
module.exports = mongoose.model('User', UserSchema);