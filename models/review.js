const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const reviewSchema = new Schema({
 body: String,
 rating: Number,
 author: {
   type: Schema.Types.ObjectId,
   ref: 'User'
 }
}, { timestamps: { createdAt: 'created_at' } });

reviewSchema.virtual('reviewDate').get(function () {
  const updatedDate = new Date(this.updatedAt).toLocaleDateString('pt-PT', { timeZone: 'GMT' });
  return updatedDate;
});

module.exports = mongoose.model('Review', reviewSchema);
