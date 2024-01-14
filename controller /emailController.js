const nodemailer = require("nodemailer");
const asyncHandler = require("express-async-handler");

const sendEmail = asyncHandler(async (data, req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL,
        pass: process.env.PASSWORD,
      },
    });

    async function main() {
      const info = await transporter.sendMail({
        from: '"Fusion Furni 👻" <foo@example.com>',
        to: data.to,
        subject: data.subject,
        text: data.text,
        html: data.htm,
      });
    }

    await main();
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = sendEmail;
