const User = require('../models/user-model');
const AppError = require('../utils/app-error');
const catchAsync = require('../utils/catch-async');
const filterObj = require('../utils/filterObj');

// UPDATES THE CURRENT USER'S PROFILE DETAILS EXCEPT PASSWORD
exports.updateMe = catchAsync(async (req, res, next) => {
	// 1) Check if password-related fields are present in the request body
	if (req.body.password || req.body.passwordConfirm)
		return next(
			new AppError(
				'This route is not for password updates. Please use the /updateMyPassword route.',
				400
			)
		);

	// 2) Filter out unwanted fields from the request body
	const filteredBody = filterObj(req.body, 'name', 'email');
	// Find and update user's information
	const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
		new: true, // Return the updated document
		runValidators: true // Run validators on update
	});

	// 3) Respond with updated user data
	res.status(200).json({ status: 'success', data: { updatedUser } });
});

// DELETES THE CURRENT USER BY SETTING THEIR 'ACTIVE' STATUS TO FALSE IN THE DATABASE.
exports.deleteMe = catchAsync(async (req, res, next) => {
	await User.findByIdAndUpdate(req.user.id, { active: false });
	res.status(204).json({ status: 'success', data: null });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
	const users = await User.find();

	res.status(200).json({
		status: 'success',
		results: users.length,
		data: { users }
	});
});

exports.getUser = (req, res) => {
	res.status(500).json({
		status: 'error',
		message: 'This route is not yet defined'
	});
};

exports.createUser = (req, res) => {
	res.status(500).json({
		status: 'error',
		message: 'This route is not yet defined'
	});
};
exports.updateUser = (req, res) => {
	res.status(500).json({
		status: 'error',
		message: 'This route is not yet defined'
	});
};
exports.deleteUser = (req, res) => {
	res.status(500).json({
		status: 'error',
		message: 'This route is not yet defined'
	});
};
