const express = require('express')
const router = new express.Router()
const controller = require('../controllers/accountController')
const favoriteController = require('../controllers/favoriteController')
const utilities = require('../utilities')
const validator = require('../utilities/account-validation')

router.get('/', utilities.checkLogin, utilities.handleErrors(controller.buildAccountManagement))

router.get('/register', utilities.handleErrors(controller.buildRegister))
router.post('/register',
    validator.registrationRules(),
    validator.registrationDataCheck,
    utilities.handleErrors(controller.register)
)

router.get('/login', utilities.handleErrors(controller.buildLogin))
router.post('/login',
    validator.loginRules(),
    validator.loginDataCheck,
    utilities.handleErrors(controller.accountLogin)
)

router.get('/logout', utilities.handleErrors(controller.accountLogout))

router.get('/update/:accountId', utilities.handleErrors(controller.buildUpdateAccount))
router.post('/update',
    validator.updateAccountRules(),
    validator.updateAccountDataCheck,
    utilities.handleErrors(controller.updateAccount)
)
router.post('/update/password',
    validator.updatePasswordRules(),
    validator.updatePasswordDataCheck,
    utilities.handleErrors(controller.changePassword)
)

/* ***************************
 * Favorites Routes
 * ************************** */
router.get('/favorites', utilities.checkLogin, utilities.handleErrors(favoriteController.buildFavorites))
router.get('/toggle-favorite/:inventory_id', utilities.checkLogin, utilities.handleErrors(favoriteController.toggleFavorite))

module.exports = router
