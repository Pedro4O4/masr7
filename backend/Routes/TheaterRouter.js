const express = require('express');
const router = express.Router();
const TheaterController = require('../Controllers/TheaterController');
const authenticationMiddleware = require('../Middleware/authenticationMiddleware');

// Helper middleware to check for admin role
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'System Admin') {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
};

// All routes require authentication
router.use(authenticationMiddleware);

// Public routes (authenticated users can view)
router.get('/', TheaterController.getAllTheaters);
router.get('/:id', TheaterController.getTheaterById);
router.get('/:theaterId/event/:eventId', TheaterController.getTheaterForEvent);

// Admin-only routes
router.post('/', adminOnly, TheaterController.createTheater);
router.put('/:id', adminOnly, TheaterController.updateTheater);
router.delete('/:id', adminOnly, TheaterController.deleteTheater);
router.put('/:id/seats', adminOnly, TheaterController.updateSeatConfig);

module.exports = router;
