const sgMail = require("@sendgrid/mail");

const { SENDGRID_API_KEY, EMAIL_FROM } = process.env;
sgMail.setApiKey(SENDGRID_API_KEY);

// const msg = {
//   to: 'pobenom251@viicard.com', // Change to your recipient
//   from: EMAIL_FROM, // Change to your verified sender
//   subject: 'Sending with SendGrid is Fun',
//   text: 'and easy to do anywhere, even with Node.js',
//   html: '<strong>and easy to do anywhere, even with Node.js</strong>',
// }
// sgMail
//   .send(msg)
//   .then(() => {
//     console.log('Email sent')
//   })
//   .catch((error) => {
//     console.error(error)
//   })

const sendEmail = async (data) => {
  const msg = { ...data, from: EMAIL_FROM };
  return sgMail.send(msg);
};

module.exports = sendEmail;