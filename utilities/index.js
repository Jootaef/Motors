const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
    let data = await invModel.getClassifications()
    let list = "<ul>"
    list += '<li><a href="/" title="Home page">Home</a></li>'
    list += '<li><a href="/account/favorites" title="My Favorites">My Favorites</a></li>'
    data.rows.forEach((row) => {
        list += "<li>"
        list +=
            '<a href="/inv/type/' +
            row.classification_id +
            '" title="See our inventory of ' +
            row.classification_name +
            ' vehicles">' +
            row.classification_name +
            "</a>"
        list += "</li>"
    })
    list += "</ul>"
    return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function (data) {
    let grid = ''
    if (data.length > 0) {
        grid = '<ul id="inv-display">'
        data.forEach(vehicle => {
            grid += '<li>'
            grid += '<a href="../../inv/detail/' + vehicle.inv_id
                + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model
                + 'details"><img src="' + vehicle.inv_thumbnail
                + '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model
                + ' on CSE Motors" /></a>'
            grid += '<div class="namePrice">'
            grid += '<hr />'
            grid += '<h2>'
            grid += '<a href="../../inv/detail/' + vehicle.inv_id + '" title="View '
                + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">'
                + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
            grid += '</h2>'
            grid += '<span>$'
                + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
            grid += '</div>'
            grid += '</li>'
        })
        grid += '</ul>'
    } else {
        grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildByInventoryId = async function (vehicle) {
    if (vehicle) {
        return `
        <div class="vehicle">
          <div>
            <img src="${vehicle.inv_image}" alt="${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}" width="500" height="330" >
          </div>
          <div>
            <h2>${vehicle.inv_make} ${vehicle.inv_model} Details</h2>
            <p><span>Price:</span>$${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</p>            
            <p><span>Description:</span>${vehicle.inv_description}</p>
            <p><span>Color:</span>${vehicle.inv_color}</p>
            <p><span>Miles:</span>${new Intl.NumberFormat('en-US').format(vehicle.inv_miles)}</p>
          </div>
        </div>
    `
    }
    return ``
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise
    .resolve(fn(req, res, next))
    .catch(next)

Util.buildClassificationList = async function (selectedId = null) {
    let data = await invModel.getClassifications()
    let html = '<select name="classificationId" id="classificationId" required>'
    html += "<option value=''>Choose a Classification</option>"
    data.rows.forEach((row) => {
        html += '<option value="' + row.classification_id + '"'
        if (selectedId != null && row.classification_id === parseInt(selectedId)) {
            html += " selected "
        }
        html += ">" + row.classification_name + "</option>"
    })
    html += "</select>"
    return html
}

Util.checkJwtToken = (req, res, next) => {
    if (req.cookies.jwt) {
        jwt.verify(
            req.cookies.jwt,
            process.env.JWT_SECRET,
            function (err, accountData) {
                if (err) {
                    req.flash('notice', 'Please log in')
                    res.clearCookie('jwt')
                    return res.redirect('/account/login')
                }
                res.locals.accountData = accountData
                res.locals.loggedIn = 1
                next()
            }
        )
    } else {
        res.locals.loggedIn = 0
        next()
    }
}

Util.checkLogin = (req, res, next) => {
    if (res.locals.loggedIn) {
        next()
    } else {
        req.flash('notice', 'Please log in')
        return res.redirect('/account/login')
    }
}

Util.canAdminister = (req, res, next) => {
    if (res.locals.accountData &&
        (res.locals.accountData.account_type === 'Admin'
            || res.locals.accountData.account_type === 'Employee')) {
        next();
    } else {
        console.warn('Forbidden. User is not allowed to make modifications.');

        const error = new Error('Forbidden')
        error.status = 403;

        next(error)
    }
};

module.exports = Util