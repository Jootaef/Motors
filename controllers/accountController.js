const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
  })
}
  
/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  let hashedPassword
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
 *  Build Account Management View
 * *************************************** */
async function buildAccountManagement(req, res) {
  let nav = await utilities.getNav()
  res.render("account/account-management", {
    title: "Account Management",
    nav,
    message: req.flash("message"),
    errors: null
  })
}

/* ****************************************
 *  Verify Account Type
 * *************************************** */
async function accTypeAuth(req, res, next) {
  let nav = await utilities.getNav()
  const token = req.cookies.jwt

  if (!token) {
    req.flash("notice", "You must be logged in to access this area.")
    return res.status(403).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    if (decoded.account_type === "Employee" || decoded.account_type === "Admin") {
      res.locals.accountData = decoded
      return next()
    } else {
      req.flash("notice", "Access denied. Employees and Admins only.")
      return res.status(403).render("account/login", {
        title: "Login",
        nav,
        errors: null,
      })
    }
  } catch (error) {
    req.flash("notice", "Invalid session. Please log in again.")
    return res.status(403).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  }
}

/* ****************************************
 *  Build the Update Form view
 * *************************************** */
async function buildUpdateView(req, res) {
  let nav = await utilities.getNav()
  const account_id = req.params.account_id
  const accountData = await accountModel.getAccountById(account_id)
  res.render("account/update", {
    title: "Update Account",
    nav,
    accountData,
    errors: null,
  })
}

/* ****************************************
 *  Process Account Update Request
 * *************************************** */
async function updateAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_id, first_name, last_name, email } = req.body
  const updateResult = await accountModel.updateAccount({ account_id, first_name, last_name, email })
  if (updateResult) {
    req.flash("notice", "Account updated successfully.")
    const updated = await accountModel.getAccountById(account_id)
    return res.render("account/account-management", { 
      title: "Account Management",
      nav,
      accountData: updated,
      errors: null 
    })
  }
  req.flash("notice", "Update failed.")
  return res.redirect(`/account/update/${account_id}`)
}

/* ****************************************
 * Process Password Update Request
 * *************************************** */
async function changePassword(req, res) {
  let nav = await utilities.getNav()
  const { account_id, password } = req.body
  const hashedPassword = await bcrypt.hash(password, 10)
  const result = await accountModel.updatePassword(account_id, hashedPassword)
  if (result) {
    req.flash("notice", "Password changed successfully.")
    const accountData = await accountModel.getAccountById(account_id)
    return res.render("account/account-management", { 
      title: "Account Management",
      nav,
      accountData,
      errors: null 
    })
  }
  req.flash("notice", "Password update failed.")
  return res.redirect(`/account/update/${account_id}`)
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, accTypeAuth, buildUpdateView, updateAccount, changePassword }