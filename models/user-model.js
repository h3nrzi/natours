const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Please tell us your name']
	},
	email: {
		type: String,
		required: [true, 'Please tell us your email'],
		unique: true,
		lowercase: true,
		validate: [validator.isEmail, 'Please provide a valid email']
	},
	photo: String,
	role: {
		type: String,
		enum: ['user', 'guide', 'lead-guide', 'admin'],
		default: 'user'
	},
	password: {
		type: String,
		required: [true, 'Please provide a password'],
		minlength: 8,
		select: false
	},
	passwordConfirm: {
		type: String,
		required: [true, 'Please confirm your password'],
		minlength: 8,
		validate: {
			// This only works on CREATE and SAVE!!!
			validator: function(value) {
				return value === this.password;
			},
			message: 'Passwords are not the same!'
		}
	},
	passwordChangedAt: Date
});

///////////////////////// DOCUMENT MIDDLEWARE

// Hashing password
userSchema.pre('save', async function(next) {
	// if password wasn't modified
	if (!this.isModified('password')) return next();

	// Hash the password with cost of 12
	this.password = await bcrypt.hash(this.password, 12);

	// Delete passwordConfirm field
	this.passwordConfirm = undefined;

	next();
});

////////////////////// INSTANCE METHOD
// Note: this points to the current document

userSchema.methods.comparePasswords = async function(candidatePassword) {
	return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
	if (this.passwordChangedAt) {
		const passwordChangedAt = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
		return JWTTimestamp < passwordChangedAt;
	}

	// False means NOT changed!
	return false;
};

module.exports = mongoose.model('User', userSchema);
