const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tour-route');
const userRouter = require('./routes/user-route');

const app = express();

// 1) Middlewares

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use(express.json());

app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
	req.requestTime = new Date().toISOString();
	next();
});

// 2) Routes

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Unhandled Routes
app.all('*', (req, res, next) => {
	// res.status(404).json({
	// 	status: 'fail',
	// 	message: `Can't find ${req.originalUrl} on the server`
	// });
	const err = new Error(`Can't find ${req.originalUrl} on the server`);
	err.statusCode = 404;
	err.status = 'fail';
	next(err);
});

app.use((err, req, res, next) => {
	const statusCode = err.statusCode || 500;
	const status = err.status || 'error';

	res.status(statusCode).json({
		status: status,
		message: err.message
	});
});

// 3) Start Server

module.exports = app;
