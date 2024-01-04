function globalErrorHandler(err, req, res, next) {
	const statusCode = err.statusCode || 500;
	const status = err.status || 'error';

	res.status(statusCode).json({
		status: status,
		message: err.message
	});
}

module.exports = globalErrorHandler;
