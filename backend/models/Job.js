// backend/models/Job.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const JobSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  skills: [
    {
      type: String,
      required: true,
    },
  ],
  budget: {
    type: Number,
    min: 0,
  },
  salary: {
    min: {
      type: Number,
      min: 0,
    },
    max: {
      type: Number,
      min: 0,
    },
  },
  location: {
    type: String,
    trim: true,
  },
  job_type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'],
  },
  company_name: {
    type: String,
    trim: true,
  },
  company_website: {
    type: String,
    trim: true,
  },
  tags: [
    {
      type: String,
      trim: true,
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
  applications: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Application',
    },
  ],
  paymentTxId: {
    type: String,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending',
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Job', JobSchema);