const jwt = require('jsonwebtoken');
const User = require('../models/user-model');
const catchAsync = require('../utils/catch-async');
const AppError = require('../utils/app-error');

function signupToken(id) {
	const { JWT_SECRET, JWT_EXPIRES_IN } = process.env;
	return jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

exports.signup = catchAsync(async (req, res, next) => {
	const newUser = await User.create({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		passwordConfirm: req.body.passwordConfirm
	});

	const token = signupToken(newUser._id);
	res.status(201).json({
		status: 'success',
		token,
		data: { user: newUser }
	});
});

exports.login = catchAsync(async (req, res, next) => {
	// 1) Check if email and password exist
	const { email, password } = req.body;
	if (!email || !password) return next(new AppError('Please provide email and password!', 400));

	// 2) Check if user exists && password is correct
	const user = await User.findOne({ email: email }).select('+password');
	if (!user || !(await user.comparePasswords(password)))
		return next(new AppError('Incorrect email and password', 401));

	// 3) If everything ok, send token to client
	const token = signupToken(user._id);
	res.status(200).json({
		status: 'success',
		token
	});
});
