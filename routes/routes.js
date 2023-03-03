const express = require("express");
const router = express.Router();
const conn = require("../conn/conn");
const upload = require("../middleware/multer.js");
const {verifyToken} = require('../middleware/verifyToken.js')
const user_controllers = require("../controller/all_users");
const admin_controller = require("../controller/admin_controller");
const contactform = require("../controller/contact_form");
const msgs_controller = require("../controller/msgs.js");
const {
  validateRegistration,validatePatient,validateLogin, validate,validateContactForm
} = require("../middleware/validations.js");  
// router.get("/", function (req, res) {
//   res.send("homepage");
// });
// router.get("/conn", conn);
router.post(
  "/doctor-registration",
  validateRegistration,
  user_controllers.new_doctor
);
router.get("/verify/:token", user_controllers.verify_email);
router.post("/doctor-login",validateLogin,validate, user_controllers.doctor_login);
router.get("/doctor-logout", user_controllers.doctor_logout);
router.post("/patient-login",validateLogin,validate, user_controllers.patient_login);
router.put("/patient-edit/:id",validatePatient, validate,verifyToken, user_controllers.edit_patient);
router.delete("/patient-delete/:id",verifyToken, user_controllers.delete_patient);
router.get("/patient-logout", user_controllers.patient_logout);

// admin
router.put("/admin/approve/:id", admin_controller.verifyUser);
// end admin
router.post("/patient-registration",validatePatient, validate,verifyToken, user_controllers.new_patient);
router.put("/update-password",verifyToken, user_controllers.update_pass_func);
router.post("/new-message",verifyToken, upload.array("attachments", 10), msgs_controller.set_new_message);
router.put("/edit-message/:id",verifyToken,msgs_controller.edit_message);
router.delete("/delete-message/:id",verifyToken, msgs_controller.delete_message);
router.delete("/delete-all-messages",verifyToken, msgs_controller.delete_all_messages);
router.put("/update-name",verifyToken, user_controllers.update_name);
router.get("/patient-list-of-a-doctor",verifyToken,user_controllers.all_patients_of_one_doctor
);
router.post("/new-contact-form",validateContactForm, contactform.new_contact_form);

module.exports = router;

