const formData = require("form-data");
const Mailgun = require("mailgun.js");
const mailgun = new Mailgun(formData);
require("dotenv").config();
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,
});
const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html: string
) => {
  try {
    const msg = await mg.messages.create(process.env.MAILGUN_DOMAIN, {
      from: `Excited User <mailgun@${process.env.MAILGUN_DOMAIN}>`,
      to: [to],
      subject: subject,
      text: text,
      html: html,
    });
    console.log(msg); // Logs response data
  } catch (err) {
    console.error(err); // Logs any error
  }
};

module.exports = sendEmail;
