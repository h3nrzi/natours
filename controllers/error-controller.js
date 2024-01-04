const AppError = require('../utils/app-error');

function sendErrorDev(err, res) {
	res.status(err.statusCode).json({
		status: err.status,
		error: err,
		message: err.message,
		stack: err.stack
	});
}

function sendErrorProd(err, res) {
	// Operational or Trusted Errors
	if (err.isOperational) {
		res.status(err.statusCode).json({
			status: err.status,
			message: err.message
		});

		// Programming or other Unknown Errors
	} else {
		console.error('🔷 ERROR', err);

		res.status(500).json({
			status: 'error',
			message: 'Something went very wrong!'
		});
	}
}

///////////

function handleCastErrorDB(error) {
	const message = `Invalid ${error.path}: ${error.value}`;
	return new AppError(message, 400);
}

function handleDuplicateFieldsDB(error) {
	// const value = error.message.match(/(["'])(\\?.)*?\1/);
	const message = `Duplicate field value: "${error.keyValue.name}" Please use another value`;
	return new AppError(message, 400);
}

function handleValidationErrorDB(error) {
	const messages = Object.values(error.errors).map((obj) => obj.message);

	const message = `Invalid input data. ${messages.join('. ')}`;
	return new AppError(message, 400);
}

///////////

function globalErrorHandler(err, req, res, next) {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error';

	if (process.env.NODE_ENV === 'development') {
		sendErrorDev(err, res);
	} else if (process.env.NODE_ENV === 'production') {
		let error = JSON.parse(JSON.stringify(err));

		// Mongoose Errors
		if (error.name === 'CastError') error = handleCastErrorDB(error);
		if (error.code === 11000) error = handleDuplicateFieldsDB(error);
		if (error.name === 'ValidationError') error = handleValidationErrorDB(error);

		sendErrorProd(error, res);
	}
}

module.exports = globalErrorHandler;
