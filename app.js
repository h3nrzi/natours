const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tour-route');
const userRouter = require('./routes/user-route');
const AppError = require('./utils/app-error');
const globalErrorHandler = require('./controllers/error-controller');

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
	next(new AppError(`Can't find ${req.originalUrl} on the server`, 404));
});

app.use(globalErrorHandler);

// 3) Start Server

module.exports = app;
