const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
const app = require('./app');

console.log('🔷 ENV:', app.get('env'));

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

const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`🔷 App running on ${port}...`);
});
