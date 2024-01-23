require('dotenv').config();
const fs = require('fs');
const mongoose = require('mongoose');
const Tour = require('../../models/tour-model');

/////////////// CONNECT TO DB

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

////////////////// READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

////////////////// IMPORT DATA INTO DATA DB
const importData = async () => {
	try {
		await Tour.create(tours);
		console.log('Data successfully loaded!');
		process.exit();
	} catch (err) {
		console.log(err);
	}
};

///////////////// DELETE ALL DATA FROM COLLECTION
const deleteData = async () => {
	try {
		await Tour.deleteMany();
		console.log('Data successfully deleted!');
		process.exit();
	} catch (err) {
		console.log(err);
	}
};

if (process.argv[2] === '--import') {
	importData();
}
if (process.argv[2] === '--delete') {
	deleteData();
}
