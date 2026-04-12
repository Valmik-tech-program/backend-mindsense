const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  family: 4, // ✅ FORCE IPv4 (IMPORTANT FIX)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP ERROR:", error);
  } else {
    console.log("SMTP Ready ✅");
  }
});

exports.sendMail = async (to, subject, html, replyTo = null) => {
  try {
    const mailOptions = {
      from: `"Mind Scan Clinic" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    if (replyTo) mailOptions.replyTo = replyTo;

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent:", info.response);
    return info;

  } catch (error) {
    console.error("❌ EMAIL ERROR:", error);
    throw error;
  }
};