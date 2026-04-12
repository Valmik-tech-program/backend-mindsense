const nodemailer = require("nodemailer");

// ✅ Updated transporter (works on Render)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// ✅ Optional: verify connection (helps debugging)
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP ERROR:", error);
  } else {
    console.log("SMTP Server is ready to send emails");
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

    if (replyTo) {
      mailOptions.replyTo = replyTo;
    }

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent:", info.response);
    return info;

  } catch (error) {
    console.error("❌ FULL EMAIL ERROR:", error);
    throw error;
  }
};