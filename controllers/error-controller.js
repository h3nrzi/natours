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

function globalErrorHandler(err, req, res, next) {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error';

	if (process.env.NODE_ENV === 'development') {
		sendErrorDev(err, res);
	} else if (process.env.NODE_ENV === 'production') {
		sendErrorProd(err, res);
	}
}

module.exports = globalErrorHandler;
