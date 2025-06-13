const utilities = require('../utilities')
const account = require('../models/account-model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()

async function buildAccountManagement(req, res) {
    let nav = await utilities.getNav()
    res.render('account/management', {
        title: 'Account Management',
        nav,
        errors: null,
    })
}

async function buildLogin(req, res) {
    let nav = await utilities.getNav()
    res.render('account/login', {
        title: 'Login',
        nav,
        errors: null,
    })
}

async function accountLogout(req, res) {
    res.clearCookie('jwt', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
    })

    res.redirect('/')
}

async function buildRegister(req, res) {
    let nav = await utilities.getNav()
    res.render('account/register', {
        title: 'Register',
        nav,
        errors: null,
    })
}

async function register(req, res) {
    let nav = await utilities.getNav()
    const {
        firstName,
        lastName,
        email,
        password
    } = req.body

    try {
        // Check if email already exists
        const emailExists = await account.checkExistingEmail(email)
        if (emailExists > 0) {
            req.flash('notice', 'Email address already exists. Please log in or register with a different email address.')
            res.status(400).render('account/register', {
                title: 'Register',
                nav,
                errors: null,
                firstName,
                lastName,
                email
            })
            return
        }

        let hashedPassword
        try {
            hashedPassword = await bcrypt.hash(password, 10)
        } catch (error) {
            console.error('Error hashing password:', error)
            req.flash('notice', 'Sorry, there was an error processing the registration')
            res.status(500).render('account/register', {
                title: 'Register',
                nav,
                errors: null,
                firstName,
                lastName,
                email
            })
            return
        }

        const accountData = await account.registerAccount(
            firstName,
            lastName,
            email,
            hashedPassword
        )

        if (!accountData) {
            throw new Error('Failed to register account')
        }

        // Remove password before creating token
        delete accountData.account_password
        
        // Create JWT token
        const accessToken = jwt.sign(accountData, process.env.JWT_SECRET, {expiresIn: 3600 * 1000})
        
        // Configure cookie based on environment
        if (process.env.NODE_ENV === 'development') {
            res.cookie("jwt", accessToken, {httpOnly: true, maxAge: 3600 * 1000})
        } else {
            res.cookie("jwt", accessToken, {httpOnly: true, secure: true, maxAge: 3600 * 1000})
        }

        req.flash('notice', `Welcome ${firstName}! Your account has been successfully registered.`)
        return res.redirect('/account/')

    } catch (error) {
        console.error('Error in register:', error)
        req.flash('notice', 'Sorry, there was an error processing your registration.')
        res.status(500).render('account/register', {
            title: 'Register',
            nav,
            errors: null,
            firstName,
            lastName,
            email
        })
    }
}

async function checkYourCredentials(req, res, email) {
    let nav = await utilities.getNav()
    req.flash('notice', 'Please check your credentials and try again.')
    res.status(400).render('account/login', {
        title: 'Login',
        nav,
        errors: null,
        email,
    })
}

async function accountLogin(req, res) {
    const {email, password} = req.body
    const accountData = await account.getAccountByEmail(email)
    if (!accountData) {
        await checkYourCredentials(req, res, email)
        return
    }
    try {
        if (await bcrypt.compare(password, accountData.account_password)) {
            delete accountData.account_password
            const accessToken = jwt.sign(accountData, process.env.JWT_SECRET, {expiresIn: 3600 * 1000})
            if (process.env.NODE_ENV === 'development') {
                res.cookie("jwt", accessToken, {httpOnly: true, maxAge: 3600 * 1000})
            } else {
                res.cookie("jwt", accessToken, {httpOnly: true, secure: true, maxAge: 3600 * 1000})
            }
            return res.redirect('/account/')
        } else {
            await checkYourCredentials(req, res, email)
        }
    } catch (error) {
        return new Error('Access Forbidden')
    }
}

async function buildUpdateAccount(req, res) {
    let nav = await utilities.getNav()
    const accountId = parseInt(req.params.accountId)
    const found = await account.getAccountById(accountId)
    res.render('account/update', {
        title: `Edit ${found.account_firstname} ${found.account_lastname}`,
        nav,
        errors: null,
        id: found.account_id,
        firstName: found.account_firstname,
        lastName: found.account_lastname,
        email: found.account_email,
    })
}

async function updateAccount(req, res) {
    const {
        updateId,
        firstName,
        lastName,
        email,
    } = req.body

    const result = await account.updateAccount(
        updateId,
        firstName,
        lastName,
        email,
    )

    if (result) {
        req.flash('notice', `${firstName} ${lastName} has been updated`)
        res.redirect('/account/')
    } else {
        let nav = await utilities.getNav()

        req.flash('notice', `Failed to update ${firstName} ${lastName}`)
        res.status(501).render('account/update', {
            title: `Update ${firstName} ${lastName}`,
            nav,
            errors: null,
            id,
            firstName,
            lastName,
            email,
        })
    }
}

async function changePassword(req, res) {
    const {
        passwordId,
        password,
    } = req.body

    let nav = await utilities.getNav()
    const found = await account.getAccountById(passwordId)
    const id = found.account_id
    const firstName = found.account_firstName
    const lastName = found.account_lastName
    const email = found.account_email

    let hashedPassword
    try {
        hashedPassword = await bcrypt.hash(password, 10)
    } catch (error) {
        req.flash('notice', 'Sorry, there was an error processing the registration')
        res.status(500).render('account/update', {
            title: `Update ${firstName} ${lastName}`,
            nav,
            errors: null,
            id,
            firstName,
            lastName,
            email,
        })
    }

    const result = await account.changePassword(id, hashedPassword)

    if (result) {
        req.flash('notice', `Password changed for ${firstName} ${lastName}`)
        res.redirect('/account/')
    } else {
        let nav = await utilities.getNav()

        req.flash('notice', `Failed to change password for ${firstName} ${lastName}`)
        res.status(501).render('account/update', {
            title: `Update ${firstName} ${lastName}`,
            nav,
            errors: null,
            id,
            firstName,
            lastName,
            email,
        })
    }
}


module.exports = {
    buildLogin,
    buildRegister,
    register,
    accountLogin,
    accountLogout,
    buildAccountManagement,
    buildUpdateAccount,
    updateAccount,
    changePassword,
}