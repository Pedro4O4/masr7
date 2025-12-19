const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser');
const cors = require("cors");
require('dotenv').config();

const app = express();
const fs = require('fs');
const path = require('path');

// Increase payload size limit
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Uploads directory created');
}

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));
// Routers
const authRouter = require("./Routes/auth");

const UserRouters = require("./Routes/UserRouter");
const EventRouters = require("./Routes/EventRouter");
const BookingRouters = require("./Routes/BookingRouter");
const TheaterRouters = require("./Routes/TheaterRouter");

// Middleware
const authenticationMiddleware = require('./Middleware/authenticationMiddleware');

// Middlewares setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_ORIGIN,
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Routes
app.use("/api/v1", authRouter);
app.use("/api/v1/user", UserRouters);
app.use("/api/v1/event", EventRouters);
app.use("/api/v1/booking", BookingRouters);
app.use("/api/v1/theater", TheaterRouters);
app.use(authenticationMiddleware);

// MongoDB connection
const db_name = process.env.DB_NAME;
const db_url = process.env.DB_URL;

mongoose.connect(db_url)
    .then(() => console.log(`MongoDB connected to ${db_name}`))
    .catch((e) => {
        console.error("MongoDB connection error:", e.message);
    });

// 404 handler
app.use(function (req, res, next) {
    const error = new Error("404 - Not Found");
    error.status = 404;
    next(error);
});

// Start server
app.listen(process.env.PORT, () => console.log("Server started"))
    .on('error', (err) => {
        console.error("Server error:", err.message);
    });
