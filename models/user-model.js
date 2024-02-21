const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/app-error');

const userSchema = new mongoose.Schema(
	{
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
		passwordChangedAt: Date,
		passwordResetToken: String,
		passwordResetExpired: Date,
		active: { type: Boolean, default: true, select: false }
	},
	{ timestamps: true }
);

///////////////////////// QUERY MIDDLEWARE

// TO MODIFY QUERIES FOR FINDING ACTIVE USERS ONLY.
userSchema.pre(/^find/, function(next) {
	this.find({ active: { $ne: false } });
	next();
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

// Update changedPasswordAt
userSchema.pre('save', function(next) {
	// Check if password is modified or it's a new user
	if (!this.isModified('password') || this.isNew) return next();

	// Update changedPasswordAt field
	this.passwordChangedAt = Date.now() - 1000;
	next();
});

////////////////////// INSTANCE METHOD
// Note: "this" points to the current document

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

userSchema.methods.createPasswordResetToken = function() {
	// Generate a random token
	const resetToken = crypto.randomBytes(32).toString('hex');

	// Hash the token using SHA-256 algorithm
	this.passwordResetToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');

	// Set expiration time to 10 minutes from the current time
	this.passwordResetExpired = Date.now() + 10 * 60 * 1000;

	// Return the unhashed token for sending to the user
	return resetToken;
};

module.exports = mongoose.model('User', userSchema);
