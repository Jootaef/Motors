const utilities = require('.')
const {body, validationResult} = require('express-validator')
const validator = {}
const accountModel = require('../models/account-model')
const req = require("express/lib/request");

validator.registrationRules = () => {
    return [
        body('firstName')
            .trim()
            .isString()
            .isLength({min: 1})
            .withMessage('Please provide a first name'),
        body('lastName')
            .trim()
            .isString()
            .isLength({min: 1})
            .withMessage('Please provide a last name'),
        body('email')
            .trim()
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email address')
            .custom(async (email) => {
                const emailExists = await accountModel.checkExistingEmail(email)
                if (emailExists) {
                    throw new Error('Email address already exists. Please log in or register with a different email address')
                }
            }),
        body('password')
            .trim()
            .isStrongPassword({
                minLength: 12,
                minLowercase: 1,
                minUppercase: 1,
                minNumber: 1,
                minSymbols: 1
            })
            .withMessage('Please provide a valid password that meets the specified requirements'),
    ]
}

validator.registrationDataCheck = async (req, res, next) => {
    const {
        firstName,
        lastName,
        email,
    } = req.body

    let errors = []
    errors = validationResult(req)

    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render('account/register', {
            errors,
            title: 'Register',
            nav,
            firstName,
            lastName,
            email,
        })
        return
    }
    next()
}

validator.loginRules = () => {
    return [
        body('email')
            .trim()
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email address'),
        body('password')
            .trim()
            .isLength({min: 1})
            .withMessage('Please provide a password'),
    ]
}

validator.loginDataCheck = async (req, res, next) => {
    const {
        email,
        password,
    } = req.body

    let errors = []
    errors = validationResult(req)

    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render('account/login', {
            errors,
            title: 'Login',
            nav,
            email,
            password,
        })
        return
    }
    next()
}

validator.updateAccountRules = () => {
    return [
        body('updateId')
            .notEmpty().withMessage('Account id is required'),
        body('firstName')
            .trim()
            .isString()
            .isLength({min: 1})
            .withMessage('Please provide a first name'),
        body('lastName')
            .trim()
            .isString()
            .isLength({min: 1})
            .withMessage('Please provide a last name'),
        body('email')
            .trim()
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email address')
            .custom(async (email, {req}) => {
                const accountId = parseInt(req.body.updateId)
                const emailExists = await accountModel.checkExistingEmailWithAccount(accountId, email)
                if (emailExists) {
                    throw new Error('Email address already exists. Please use a different email address')
                }
            }),
    ]
}

validator.updateAccountDataCheck = async (req, res, next) => {
    const {
        updateId,
        firstName,
        lastName,
        email,
    } = req.body

    let errors = []
    errors = validationResult(req)

    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render(`account/update`, {
            errors,
            title: `Update ${firstName} ${lastName}`,
            nav,
            id: updateId,
            firstName,
            lastName,
            email,
        })
        return
    }
    next()
}

validator.updatePasswordRules = () => {
    return [
        body('password')
            .trim()
            .isStrongPassword({
                minLength: 12,
                minLowercase: 1,
                minUppercase: 1,
                minNumber: 1,
                minSymbols: 1
            })
            .withMessage('Please provide a valid password that meets the specified requirements'),
    ]
}

validator.updatePasswordDataCheck = async (req, res, next) => {
    const {
        passwordId
    } = req.body

    let errors = []
    errors = validationResult(req)

    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        const account = await accountModel.getAccountById(passwordId)
        res.render('account/update', {
            errors,
            title: `Update ${account.account_firstname} ${account.account_lastname}`,
            nav,
            id: passwordId,
            firstName: account.account_firstname,
            lastName: account.account_lastname,
            email: account.account_email,
        })
        return
    }
    next()
}

module.exports = validator