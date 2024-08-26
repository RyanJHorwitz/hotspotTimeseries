const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Function to serve this specific json message
app.get('/message', (req, res) => {
    res.json({ message: "Hello from server!" });
});

// Function to serve all static files inside images directory
app.use('/images', express.static('../client/public/images'));
app.use('/images/savannah', express.static('../client/public/images/savannah'));
app.use('/images/forest', express.static('../client/public/images/forest'));

// Function to serve all static files inside data directory
app.use('/data', express.static('../client/public/data'));

// Specify port to listen on
app.listen(8000, () => {
    console.log(`Server is running on port 8000.`);
});