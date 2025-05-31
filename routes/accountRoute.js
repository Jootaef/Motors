// Needed Resources
const express = require("express");
const router = new express.Router();
const utilities = require("../utilities");
const accountController = require("../controllers/accountController");
const { registrationRules } = require("../utilities/account-validation")


// Route to build "My Account" view
router.get(
  "/", 
  utilities.handleErrors(accountController.buildAccount)
);

// Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Route to deliver the registration view
router.get("/register", accountController.buildRegister);

// Route to process the registration form submission
router.post('/register', utilities.handleErrors(accountController.registerAccount));

// Export the router

// Process the login attempt
router.post(
  "/login",
  (req, res) => {
    res.status(200).send('login process')
  }
)

module.exports = router;
