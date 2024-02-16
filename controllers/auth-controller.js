const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/user-model');
const catchAsync = require('../utils/catch-async');
const AppError = require('../utils/app-error');
const sendEmail = require('../utils/email');

function signToken(id) {
	const { JWT_SECRET, JWT_EXPIRES_IN } = process.env;
	return jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

async function verifyToken(token) {
	const { JWT_SECRET } = process.env;
	return await promisify(jwt.verify)(token, JWT_SECRET);
}

exports.signup = catchAsync(async (req, res, next) => {
	const { name, email, password, passwordConfirm, passwordChangedAt, role } = req.body;
	const newUser = await User.create({
		name,
		email,
		password,
		passwordConfirm,
		passwordChangedAt,
		role
	});

	const token = signToken(newUser._id);
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
	const token = signToken(user._id);
	res.status(200).json({
		status: 'success',
		token
	});
});

exports.protect = catchAsync(async (req, res, next) => {
	// 1) Getting token and check of it's there
	let token;
	if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
		token = req.headers.authorization.split(' ')[1];
	}
	if (!token) return next(new AppError('you are not logged in! please log in to get access.', 401));

	// 2) Verification token
	const decodedToken = await verifyToken(token);

	// 3) Check if user still exists
	const currentUser = await User.findById(decodedToken.id);
	if (!currentUser)
		return next(new AppError('The user belonging to this token does no longer exist.', 401));

	// 4) Check if user changed password after the token was issued
	if (currentUser.changedPasswordAfter(decodedToken.iat))
		return next(new AppError('User recently changed password! Please log ing again', 401));

	// GRANT ACCESS TO PROTECTED ROUTE
	req.user = currentUser;
	next();
});

exports.restrictTo = (...roles) => {
	return (req, res, next) => {
		// Roles ['admin', 'lead-guide']
		if (!roles.includes(req.user.role))
			return next(new AppError('You do not have permission to perform this action!', 403));
		next();
	};
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
	// 1) Find user by email
	const user = await User.findOne({ email: req.body.email });
	if (!user) return next(new AppError('There is no user with that email address.', 404));

	// 2) Create password reset token and save user
	const resetToken = user.createPasswordResetToken();
	await user.save({ validateBeforeSave: false });

	// 3) Construct reset URL, compose email message, and send email
	const resetURL = `${req.protocol}://${req.get('host')}/api/v1/resetPassword/${resetToken}`;
	const message = `Forgot your password?
	Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.
	If you didn't forget your password, please ignore this email!`;

	try {
		await sendEmail({
			email: user.email,
			subject: 'Your password reset token',
			message
		});
	} catch (error) {
		user.passwordResetToken = undefined;
		user.passwordResetExpired = undefined;
		await user.save({ validateBeforeSave: false });

		return next(new AppError('There was an error sending the email. Try again later!', 500));
	}

	// 4) Respond with success status and message
	res.status(200).json({ status: 'success', message: 'Token sent to your email!' });
});

exports.resetPassword = async (req, res, next) => {
	console.log('hi');
	// 1) Find user with matching hashed token and valid expiration date
	const hashedToken = crypto
		.createHash('sha256')
		.update(req.params.token)
		.digest('hex');
	const user = await User.findOne({
		passwordResetToken: hashedToken,
		passwordResetExpired: { $gt: Date.now() }
	});
	if (!user) return next(new AppError('Invalid or expired token', 400));

	// 2) Update user's password and clear reset token and expiration date
	user.password = req.body.password;
	user.passwordConfirm = req.body.passwordConfirm;
	user.passwordResetToken = undefined;
	user.passwordResetExpired = undefined;
	await user.save();

	// 3) Sign a new authentication token for the user
	const token = signToken(user._id);

	// 4) Respond with success status, new token, and updated user data
	res.status(201).json({ status: 'success', token, data: { user } });
};
