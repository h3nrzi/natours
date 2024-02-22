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

/**
 * Creates a JWT token, sets it as a cookie, and sends it along with user data as a response.
 * @param {object} user - User object containing user information.
 * @param {number} statusCode - HTTP status code to be sent in the response.
 * @param {object} res - Express response object.
 */
function createAndSendToken(user, statusCode, res) {
	// Set cookie options including expiration time and HTTP only flag
	const { JWT_COOKIE_EXPIRES_IN, NODE_ENV } = process.env;
	const cookieOptions = {
		expires: new Date(Date.now() + JWT_COOKIE_EXPIRES_IN * 8640000),
		httpOnly: true
	};
	// If in production, set cookie secure flag
	if (NODE_ENV === 'production') cookieOptions.secure = true;

	// Generate JWT token and set it as a cookie
	const token = signToken(user._id);
	res.cookie('jwt', token, cookieOptions);

	// Remove sensitive information (password) from user object
	user.password = undefined;

	// Send success response with token and user data
	res.status(statusCode).json({
		status: 'success',
		token,
		data: { user: user }
	});
}

//////////////////////

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

	createAndSendToken(newUser, 201, res);
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
	createAndSendToken(user, 200, res);
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

	// 3) Sign a new authentication token for the user,
	// Respond with success status, new token, and updated user data
	createAndSendToken(user, 200, res);
};

// UPDATES THE PASSWORD FOR THE CURRENT USER
exports.updatePassword = catchAsync(async (req, res, next) => {
	// 1) Fetch the user by id and select password field
	const user = await User.findById(req.user.id).select('+password');

	// 2) Check if the provided current password matches the stored password
	if (!(await user.comparePasswords(req.body.passwordCurrent)))
		return next(new AppError('رمز عبور فعلی شما اشتباه است!', 401));

	// 3) Update user's password and password confirmation
	user.password = req.body.password;
	user.passwordConfirm = req.body.passwordConfirm;
	await user.save(); // User.findByIdAndUpdate will NOT work!!!

	// 4) Create and send token along with updated user data
	createAndSendToken(user, 200, res);
});
