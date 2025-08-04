const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true 
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    bio: {
        type: String,
        maxlength: 500
    },
    linkedin_url: {
        type: String,
        match: /^(https?:\/\/)?(www\.)?linkedin\.com\/.*$/i 
    },
    skills: {
        type: [String], 
        default: []
    },
    public_wallet_address: {
        type: String,
        unique: true, 
        sparse: true 
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

ProfileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});


module.exports = mongoose.model('Profile', ProfileSchema);