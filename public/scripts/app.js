const express = require('express');
const path = require('path');
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const app = express();

// Serve static files from the correct folder
app.use(express.static(path.join(__dirname, '../html')));
app.use(express.static(path.join(__dirname, '../styles')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../html/index.html'));
});

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
