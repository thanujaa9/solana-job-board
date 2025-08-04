const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
    minlength: [5, 'Post content must be at least 5 characters long'],
    maxlength: [1000, 'Post content cannot exceed 1000 characters'],
  },
  title: { 
    type: String,
    trim: true,
    maxlength: [100, 'Post title cannot exceed 100 characters'],
  },
  image: { 
    type: String,
  },
  likes: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
  ],
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      text: {
        type: String,
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Post', PostSchema);