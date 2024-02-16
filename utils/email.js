const nodemailer = require('nodemailer');

const sendEmail = async ({ email, subject, message }) => {
	const { EMAIL_USERNAME, EMAIL_PASSWORD, EMAIL_HOST, EMAIL_PORT } = process.env;

	// 1) Create a transporter
	const transporter = nodemailer.createTransport({
		host: EMAIL_HOST,
		port: EMAIL_PORT,
		auth: {
			user: EMAIL_USERNAME,
			pass: EMAIL_PASSWORD
		}
	});

	// 2) Define the email options
	const mailOptions = {
		from: 'Hossein Rezaei <rezaeig22@gmail.com>',
		to: email,
		subject: subject,
		text: message
	};

	// 3) Actually send the email
	await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
