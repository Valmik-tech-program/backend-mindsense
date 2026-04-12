const User = require("../models/user");
const Doctor = require("../models/doctor");
const { sendMail } = require("../utils/mailer");

exports.bookAppointment = async (req, res) => {
  try {
    const { name, email, message, date, doctorId, time } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found. Please register an account with this email first." });
    }

    user.appointments.push({
      doctorId,
      name,
      email,
      message,
      date,
      time,
      status: "Pending"
    });

    await user.save();
    
    // Get the newly created appointment ID
    const newAppointment = user.appointments[user.appointments.length - 1];
    
    // Process Doctor Notification via Nodemailer
    try {
      const doctor = await Doctor.findById(doctorId);
      if (doctor) {
        const destEmail = doctor.email || process.env.EMAIL_USER;
        const emailHtml = `
          <h2>New Appointment Request for ${doctor.name}</h2>
          <p><strong>Patient Name:</strong> ${name}</p>
          <p><strong>Patient Email:</strong> ${email}</p>
          <p><strong>Requested Date:</strong> ${new Date(date).toLocaleString()} at ${time}</p>
          <p><strong>Message:</strong> ${message || "No additional message"}</p>
        `;
        
        await sendMail(destEmail, `New Appointment Request from ${name}`, emailHtml, email);
      }
    } catch (mailError) {
      console.error("Warning: Failed to dispatch email to doctor", mailError);
    }

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment: newAppointment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to book appointment", error: error.message });
  }
};

exports.handleAppointmentAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.query; // 'accept' or 'reject'
    
    const user = await User.findOne({ "appointments._id": id });
    if (!user) return res.status(404).send("<h2>Appointment not found inside any User record</h2>");

    const appointment = user.appointments.id(id);

    if (appointment.status !== "Pending") {
      return res.send(`<h2>This appointment has already been ${appointment.status.toLowerCase()}.</h2>`);
    }

    const doctor = appointment.doctorId ? await Doctor.findById(appointment.doctorId) : null;
    const doctorName = doctor ? doctor.name : "Your Doctor";

    if (action === "accept") {
      appointment.status = "Confirmed";
      await user.save();
      
      const emailHtml = `
        <h2>Your Appointment is Confirmed!</h2>
        <p>Hello ${appointment.name},</p>
        <p><strong>${doctorName}</strong> has accepted your appointment request for <strong>${new Date(appointment.date).toLocaleString()}</strong>.</p>
        <p>We look forward to seeing you. Please arrive 10 minutes early.</p>
      `;
      await sendMail(appointment.email, "Appointment Confirmed - Mind Scan", emailHtml);
      return res.send("<h2 style='color: green; font-family: sans-serif;'>Appointment Confirmed! An email has been sent to the patient.</h2><p>You can close this window now.</p>");
      
    } else if (action === "reject") {
      appointment.status = "Rejected";
      await user.save();
      
      const emailHtml = `
        <h2>Update Regarding Your Appointment Request</h2>
        <p>Hello ${appointment.name},</p>
        <p>We apologize, but <strong>${doctorName}</strong> was unable to accept your appointment request for <strong>${new Date(appointment.date).toLocaleString()}</strong> due to scheduling conflicts.</p>
        <p>Please log in to try scheduling for a different time.</p>
      `;
      await sendMail(appointment.email, "Appointment Application Update - Mind Scan", emailHtml);
      return res.send("<h2 style='color: red; font-family: sans-serif;'>Appointment Rejected. An email has been sent to the patient notifying them.</h2><p>You can close this window now.</p>");
    } else {
      return res.status(400).send("<h2>Invalid action parameter.</h2>");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("<h2>An error occurred processing the appointment.</h2>");
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const users = await User.find().populate("appointments.doctorId");
    let allAppointments = [];
    users.forEach(user => {
      allAppointments = [...allAppointments, ...user.appointments];
    });
    res.status(200).json(allAppointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch appointments", error: error.message });
  }
};

exports.getMyAppointments = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "Email parameter is required." });
    }
    const user = await User.findOne({ email }).populate("appointments.doctorId", "name image speciality experience fees address");
    if (!user) return res.status(200).json([]);
    
    res.status(200).json(user.appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch your appointments.", error: error.message });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ "appointments._id": id });
    if (!user) return res.status(404).json({ message: "Appointment not found" });

    user.appointments.pull(id);
    await user.save();

    res.status(200).json({ message: "Appointment cancelled successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to cancel appointment", error: error.message });
  }
};
