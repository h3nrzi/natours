const fs = require('fs');
const Tour = require('../models/tour-model');

exports.getAllTours = (req, res) => {
	// res.status(200).json({
	// 	status: 'success',
	// 	requestedAt: req.requestTime,
	// 	results: tours.length,
	// 	// data: {
	// 	// 	tours: tours
	// 	// }
	// });
};

exports.getTour = (req, res) => {
	// const id = parseInt(req.params.id);
	// const tour = tours.find((tour) => tour.id === id);
	// res.status(200).json({
	// 	status: 'success',
	// 	data: {
	// 		tour: tour
	// 	}
	// });
};

exports.createTour = async (req, res) => {
	try {
		// const newTour = new Tour({});
		// newTour.save()
		const newTour = await Tour.create(req.body);

		res.status(201).json({
			status: 'success',
			data: {
				tour: newTour
			}
		});
	} catch (err) {
		res.status(400).json({
			status: 'fail',
			message: 'Invalid data sent'
		});
	}
};

exports.updateTour = (req, res) => {
	res.status(200).json({
		status: 'success',
		data: {
			tour: 'Updated tour'
		}
	});
};

exports.deleteTour = (req, res) => {
	res.status(204).json({
		status: 'success',
		data: null
	});
};
