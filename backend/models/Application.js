// backend/models/Application.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ApplicationSchema = new Schema({
  job: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'scheduled', 'rejected', 'hired'],
    default: 'pending',
  },
  coverLetter: {
    type: String,
  },
  resume: {
    type: String,
  },
  applicationDate: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Application', ApplicationSchema);