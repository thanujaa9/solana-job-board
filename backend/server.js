require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const authMiddleware = require('./middleware/auth');
connectDB();

require('./models/User');
require('./models/Job');
require('./models/Profile');
require('./models/Application');

app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/jobs', require('./routes/api/jobs'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/applications', require('./routes/api/applications'));

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
