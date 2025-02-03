const express = require('express');
const path = require('path');

const app = express();

// Serve static files from the correct folder
app.use(express.static(path.join(__dirname, '../html')));
app.use(express.static(path.join(__dirname, '../styles')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../html/index.html'));
});

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
