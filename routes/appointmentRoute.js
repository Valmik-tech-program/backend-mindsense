const express = require("express");
const {
  bookAppointment,
  getAppointments,
  handleAppointmentAction,
  getMyAppointments,
  cancelAppointment
} = require("../controllers/appointmentController");
const router = express.Router();

router.post("/", bookAppointment);
router.get("/my-appointments", getMyAppointments);
router.get("/", getAppointments); // For getting all appointments, if needed
router.get("/action/:id", handleAppointmentAction);
router.delete("/:id", cancelAppointment);

module.exports = router;
