const { check, validationResult } = require("express-validator");

const validateRegistration = [
  check("name").not().isEmpty().withMessage("Name is required"),
  check("email").isEmail().withMessage("Invalid email address"),
  check("password"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  },
];
const validatePatient = [
  check("name").not().isEmpty().withMessage("Name is required"),
  check("date_of_birth")
    .not()
    .isEmpty()
    .withMessage("Date of birth is required"),
  check("email")
    .not()
    .isEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),
  check("password").not().isEmpty().withMessage("Password is required"),
  check("device_barcode")
    .not()
    .isEmpty()
    .withMessage("Device barcode is required"),
  check("notes").not().isEmpty().withMessage("Patient notes required"),
  check("date_of_birth").not().isEmpty().withMessage("Date of birth required"),
  check("medical_condition")
    .not()
    .isEmpty()
    .withMessage("Medical condition required"),
];
const validateLogin = [
  check("email")
    .not()
    .isEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),
  check("password").not().isEmpty().withMessage("Password is required"),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const validateContactForm = [
  check("name").not().isEmpty().withMessage("Name is required"),
  check("email").isEmail().withMessage("Invalid email address"),
  check("message").not().isEmpty().withMessage("Message is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = {
  validateRegistration,
  validatePatient,
  validateLogin,
  validate,
  validateContactForm,
};
