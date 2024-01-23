require('dotenv').config();
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
	console.log(err.name, err.message);
	console.log('🔷 Uncaught Exception! Shutting down...');
	process.exit(1);
});

const app = require('./app');

const DB = process.env.DATABASE_URL;
mongoose
	.connect(DB, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false,
		useUnifiedTopology: true,
		authSource: 'admin'
	})
	.then(() => console.log('🔷 DB connection successful!'));
// .catch((err) => console.log('🔷 ERROR'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
	console.log(`🔷 App running on ${port}...`);
});

process.on('unhandledRejection', (err) => {
	// console.log(err.name, err.message);
	console.log('🔷 Unhandled Rejection! Shutting down...');
	server.close(() => {
		process.exit(1);
	});
});
