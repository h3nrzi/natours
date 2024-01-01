const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
const app = require('./app');

console.log('ENV:', app.get('env'));

const DB = process.env.DATABASE_CLOUD.replace('<PASSWORD>', process.env.DATABASE_CLOUD_PASSWORD);
// const DB = process.env.DATABASE_LOCAL;
mongoose
	.connect(DB, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false,
		useUnifiedTopology: true
	})
	.then(() => console.log('DB connection successful!'));

const tourSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'A tour must have a name'],
		unique: true
	},
	rating: {
		type: Number,
		default: 4.5
	},
	price: {
		type: Number,
		required: [true, 'A tour must have a price']
	}
});

const Tour = mongoose.model('Tour', tourSchema);

const testTour = new Tour({
	name: 'The Park Camper',
	price: 997
});

testTour
	.save()
	.then((document) => console.log(document))
	.catch((err) => console.log('❌ERROR:', err));

const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`App running on ${port}...`);
});
