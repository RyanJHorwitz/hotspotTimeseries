const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors({
  origin: "https://hotspot-timeseries-frontend.vercel.app",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Root path handler so "Cannot GET /" disappears
app.get('/', (req, res) => {
    res.send('Backend server is running successfully!');
});

// Root path handler so "Cannot GET /" disappears
app.get('/', (req, res) => {
    res.send('Backend server is running successfully!');
});

// Function to serve this specific json message
app.get('/message', (req, res) => {
    res.json({ message: "Hello from server!" });
});

// FIX STATIC PATHS: Move the data/images into the server folder (see Step 2)
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/images/savannah', express.static(path.join(__dirname, 'public/images/savannah')));
app.use('/images/forest', express.static(path.join(__dirname, 'public/images/forest')));
app.use('/data', express.static(path.join(__dirname, 'public/data')));
// FIX STATIC PATHS: Move the data/images into the server folder (see Step 2)
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/images/savannah', express.static(path.join(__dirname, 'public/images/savannah')));
app.use('/images/forest', express.static(path.join(__dirname, 'public/images/forest')));
app.use('/data', express.static(path.join(__dirname, 'public/data')));

// Remove or isolate your standard app.listen block:
if (process.env.NODE_ENV !== 'production') {
    app.listen(8000, () => {
        console.log(`Server is running on port 8000.`);
    });
}

// 🌟 YOU MUST ADD THIS LINE AT THE VERY BOTTOM 🌟
module.exports = app;
