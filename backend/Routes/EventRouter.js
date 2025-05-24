const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const eventController = require('../Controllers/EventController');
const authentication = require('../Middleware/authenticationMiddleware');
const authorizationMiddleware = require('../Middleware/authorizationMiddleware');

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Folder to store uploaded files
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Unique file name
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only images (jpeg, jpg, png) are allowed'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB file size limit
    }
});

// Apply authentication middleware to all routes
router.use(authentication);

// Routes
router.post('/',
    authorizationMiddleware(['Organizer']),
    upload.single('image'), // Add file upload to create event
    eventController.createEvent
);

router.get("/all",
    authorizationMiddleware(['System Admin']),
    eventController.getAllEvents
);

router.get("/",
    authorizationMiddleware(['Organizer', 'System Admin', 'Standard User']),
    eventController.getApprovedEvents
);

router.get('/:id',
    authorizationMiddleware(["Organizer", 'System Admin', "Standard User"]),
    eventController.getEventById
);

router.put('/:id',
    authorizationMiddleware(['Organizer', 'System Admin']),
    upload.single('image'), // Add file upload middleware to update route
    eventController.updateEvent
);

router.delete('/:id',
    authorizationMiddleware(['Organizer', 'System Admin']),
    eventController.deleteEvent
);

module.exports = router;