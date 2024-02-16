const express = require('express');
const tourController = require('../controllers/tour-controller');
const authController = require('../controllers/auth-controller');

const router = express.Router();

router.get('/monthly-plan/:year', tourController.getMonthlyPlan);
router.get('/tour-stats', tourController.getTourStats);
router.get('/top-5-cheap', tourController.aliasTopTours, tourController.getAllTours);

router
	.route('/')
	.get(authController.protect, tourController.getAllTours)
	.post(tourController.createTour);

router
	.route('/:id')
	.get(tourController.getTour)
	.patch(tourController.updateTour)
	.delete(tourController.deleteTour);

module.exports = router;
