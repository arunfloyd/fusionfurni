const nodemailer = require("nodemailer");
const asyncHandler = require("express-async-handler");

const sendEmail = asyncHandler(async (data, req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", // Corrected typo in the host
      port: 465,
      secure: true,
      auth: {
        // TODO: replace `user` and `pass` values from <https://forwardemail.net>
        user: process.env.GMAIL,
        pass: process.env.PASSWORD,
      },
    });

    // async..await is not allowed in global scope, must use a wrapper
    async function main() {
      console.log("Before sending email");
      const info = await transporter.sendMail({
        from: '"Fusion Furni 👻" <foo@example.com>', // sender address
        to: data.to, // list of receivers
        subject: data.subject,
        text: data.text, // plain text body
        html: data.htm, // html body
      });

      // Log the info outside the main function
      console.log("Email sent successfully", info);

      // send mail with defined transport object
      console.log("Message sent: %s", info.messageId);
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com
    }

    // Call the main function
    await main();
  } catch (error) {
    console.error("Error sending email:", error);
  }
});

module.exports = sendEmail;
