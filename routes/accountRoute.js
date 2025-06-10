// Needed Resources
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const accValidate = require('../utilities/account-validation')

// Login route
router.get(
  "/login", 
  utilities.handleErrors(accountController.buildLogin)
)

// Registration route (GET)
router.get(
  "/register", 
  utilities.handleErrors(accountController.buildRegister)
)

// Check registration data route
router.post(
    "/register",
    accValidate.registrationRules(),
    accValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
)

// Check login data route
router.post(
  "/login",
  accValidate.loginRules(),
  accValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Check login request route
router.get(
  "/", 
  utilities.checkLogin, 
  utilities.handleErrors(accountController.buildAccountManagement)
)

// Display Update Form route
router.get(
  "/update/:account_id", 
  accountController.buildUpdateView
)

// Process Update Form Route
router.post(
  "/update", 
  accValidate.updateRules(), 
  accountController.updateAccount
)

// Password update route
router.post(
  "/update-password", 
  accValidate.passwordRules(), 
  accountController.changePassword
)

// Logout route
router.get("/logout", (req, res) => {
  res.clearCookie("jwt")
  req.flash("notice", "You have logged out.")
  res.redirect("/")
})

module.exports = router