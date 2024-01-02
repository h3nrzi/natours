const Tour = require('../models/tour-model');

exports.getAllTours = async (req, res) => {
	try {
		// 1) BUILD QUERY
		// 1A) Filtering
		const queryObj = { ...req.query };
		const excludedFields = ['page', 'sort', 'limit', 'fields'];
		excludedFields.forEach((field) => delete queryObj[field]);

		// 1B) Advance Filtering;
		let queryStr = JSON.stringify(queryObj);
		queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

		let query = Tour.find(JSON.parse(queryStr));
		// 1C) Sorting
		if (req.query.sort) {
			const sortBy = req.query.sort.split(',').join(' ');
			query = query.sort(sortBy);
		} else {
			query = query.sort('-createdAt');
		}

		// 2) EXECUTE QUERY
		const tours = await query;

		// 3) SEND RESPONSE
		res.status(200).json({
			status: 'success',
			results: tours.length,
			data: {
				tours: tours
			}
		});
	} catch (err) {
		res.status(400).json({
			status: 'fail',
			message: err.message
		});
	}
};

exports.getTour = async (req, res) => {
	try {
		// const tour = await Tour.findOne({ _id: req.params.id });
		const tour = await Tour.findById(req.params.id);
		res.status(200).json({
			status: 'success',
			data: {
				tour: tour
			}
		});
	} catch (err) {
		res.status(400).json({
			status: 'fail',
			message: err.message
		});
	}
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

exports.updateTour = async (req, res) => {
	try {
		const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true
		});

		res.status(200).json({
			status: 'success',
			data: {
				tour: tour
			}
		});
	} catch (err) {
		res.status(400).json({
			status: 'fail',
			message: err.message
		});
	}
};

exports.deleteTour = async (req, res) => {
	try {
		await Tour.findByIdAndDelete(req.params.id);

		res.status(204).json({
			status: 'success',
			data: {
				tour: null
			}
		});
	} catch (err) {
		res.status(400).json({
			status: 'fail',
			message: err.message
		});
	}
};
