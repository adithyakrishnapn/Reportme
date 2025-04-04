require('dotenv').config();

const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const userRouter = require("./routes/userRoutes");
const db = require("./config/connection");
const cors = require("cors");
const path = require("path");
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

// Enable CORS
app.use(cors());


// Database connection
db.connect((err) => {
    if (err) {
        console.error("Error connecting to database:", err);
    } else {
        console.log("Connected to database");
    }
});

// Middleware
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api", userRouter);



// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Something broke!',
        error: err.message 
    });
});





// Start the server
const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
// At the end of your app.js, before module.exports