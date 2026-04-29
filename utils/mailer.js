const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendMail = async (to, subject, html, replyTo = null) => {
  try {
    const mailOptions = {
      from: `"Mind Scan Clinic" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };
    
    if (replyTo) {
      mailOptions.replyTo = replyTo;
    }

    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent successfully: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email: ", error);
    throw error;
  }
};
