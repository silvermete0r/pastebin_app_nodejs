const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');
const cron = require('node-cron');
const session = require('express-session');
const shortId = require('shortid');
require('dotenv').config();

const app = express();
app.set('view engine', 'ejs');
const PORT = process.env.PORT || 3000;
const mongoAtlasUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pastebin';

mongoose.connect(mongoAtlasUri, { serverSelectionTimeoutMS: 3000 });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Configure session middleware
app.use(session({
    secret: 'mySecret',
    resave: false,
    saveUninitialized: false
}));

// EJS template files
app.set('views', path.join(__dirname, 'views'));

// Main route / Login
app.get(['/', '/login_page'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serve registration page
app.get('/register_page', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Serve pastes page
app.get('/pastes', (req, res) => {
    // Check if user is logged in
    if (req.session && req.session.userId) {
        res.sendFile(path.join(__dirname, 'public', 'home.html'));
    } else {
        res.redirect('/login_page');
    }
});

// Middleware to parse JSON request body
app.use(express.json());

// Define schema and model for pastes
const pasteSchema = new mongoose.Schema({
    _id: { type: String, default: shortId.generate },
    title: String,
    content: String,
    created_at: { type: Date, default: Date.now },
    expiration_date: Date,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Reference to User model
});

const Paste = mongoose.model('Paste', pasteSchema);

// Define schema and model for users
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true},
});

const User = mongoose.model('User', userSchema);

// User registration endpoint
app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// User login endpoint
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        
        // Check if user exists and password is correct
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Set userId in session
        req.session.userId = user._id;
        
        // Send success response
        res.status(200).json({ message: 'Login successful' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Pastes auto-deletion logic
pasteSchema.statics.deleteExpiredPastes = async function() {
    try {
        const currentDate = new Date();
        await this.deleteMany({ expiration_date: { $lte: currentDate } }).exec();
        console.log('Expired pastes deleted successfully');
    } catch (err) {
        console.error('Error deleting expired pastes:', err);
    }
};

// REST API endpoints
app.post('/api/pastes', async (req, res) => {
    try {
        const { title, content, expiration_date } = req.body;
        const author = req.session.userId;
        const paste = new Paste({ title, content, expiration_date, author });
        await paste.save();
        res.status(201).json(paste);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/pastes', async (req, res) => {
    try {
        const userId = req.session.userId;
        const pastes = await Paste.find({ author: userId }).exec();
        res.json(pastes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/pastes/:id', async (req, res) => {
    try {
        const paste = await Paste.findById(req.params.id).exec();
        if (!paste) {
            return res.status(404).json({ message: 'Paste not found' });
        }
        res.json(paste);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/pastes/:id/page', async (req, res) => {
    try {
        const paste = await Paste.findById(req.params.id).exec();
        if (!paste) {
            return res.status(404).json({ message: 'Paste not found' });
        }
        const author = await User.findById(paste.author).exec();
        paste.author = author;
        res.render('paste', { paste });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.put('/api/pastes/:id', async (req, res) => {
    try {
        const { title, content, expiration_date } = req.body;
        const updatedPaste = await Paste.findByIdAndUpdate(req.params.id, { title, content, expiration_date }, { new: true }).exec();
        res.json(updatedPaste);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.delete('/api/pastes/:id', async (req, res) => {
    try {
        await Paste.findByIdAndDelete(req.params.id).exec();
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy();
    res.status(200).json({ message: 'Logged out successfully' });
});

app.get('/current_user', async (req, res) => {
    if (req.session && req.session.userId) {
        const user = await User.findById(req.session.userId).exec();
        res.json(user);
    } else {
        res.status(401).json({ message: 'Not logged in' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);

    // Schedule the auto-deletion task to run every hour
    cron.schedule('0 * * * *', async () => {
        console.log('Running auto-deletion task...');
        await Paste.deleteExpiredPastes();
    });
});

module.exports = app;