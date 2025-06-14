/* Main server file - Controls the application */

/* Required packages */
const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const env = require('dotenv').config()
const app = express()
const staticFiles = require('./routes/static')
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const utilities = require("./utilities/")
const session = require("express-session")
const pool = require('./database/')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

/* Middleware setup */
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
    tableName: 'session',
    pruneSessionInterval: 60,
    schema: {
      tableName: 'session',
      columnNames: {
        sid: 'sid',
        sess: 'sess',
        expire: 'expire'
      }
    }
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: 'sessionId',
  cookie: {
    maxAge: 1000 * 60 * 60,
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true
  }
}))

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(utilities.checkJwtToken)

/* View engine setup */
app.set('view engine', 'ejs')
app.use(expressLayouts)
app.set('layout', './layouts/layout') // not at views root

/* Routes */
app.use(staticFiles)
// Index route
app.get('/', utilities.handleErrors(baseController.buildHome))
// Inventory routes
app.use("/inv", utilities.handleErrors(inventoryRoute))
// Account routes
app.use("/account", require("./routes/accountRoute"))

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'})
})

/* Error handler */
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.status}: ${err.message}`)
  if (err.status === 404) {
    message = err.message
  } else if (err.status === 403) {
    message = 'Access denied'
  } else {
    message = 'Something went wrong! Please try again. If the problem persists, contact me on the corner, near the flagpole, for your beating.'
  }
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message: message,
    nav
  })
})

/* Server configuration */
const port = process.env.PORT
const host = process.env.HOST

/* Start server */
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
