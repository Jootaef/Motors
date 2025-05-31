/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const app = express();
const static = require("./routes/static");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const utilities = require("./utilities/");
const session = require("express-session");
const pool = require('./database/');
const accountRoute = require("./routes/accountRoute");


/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
  });
}

module.exports = { buildLogin };

/* ***********************
 * Middleware
 * ************************/
 app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET || 'fallbackSecret123', // this avoids the crash
  resave: false,
  saveUninitialized: false,
  name: 'sessionId',
  cookie: {
    secure: false, // set true in production with HTTPS
    maxAge: 1000 * 60 * 60 * 2 // 2 hours
  }
}));

// Error.captureStackTrace
// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // logs the stack trace
  res.status(500).json({
    error: err.name,
    message: err.message,
  });
});

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res);
  next();
});

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // not at views root

/* ***********************
 * Routes
 *************************/
// Static route
app.use(express.static("public"));
// Index route
app.get("/", utilities.handleErrors(baseController.buildHome));
// Inventory routes
app.use("/inv", inventoryRoute);
// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'});
});

// Account routes
app.use("/account", require("./routes/accountRoute"));

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 5501;
const host = process.env.HOST;

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message: err.message,
    nav
  });
});

app.use(session({
  secret: 'your-secret-key-here', // This is what's missing
  resave: false,
  saveUninitialized: true
}));

app.use(session({
  secret: process.env.SESSION_SECRET || 'temporary-fallback-secret-key',
  secret: process.env.SESSION_SECRET || 'fallbackSecret123', // fallback helps during dev
  secret: process.env.SESSION_SECRET || 'fallbackSecret123', // this avoids the crashAdd commentMore actions
  resave: false,
  saveUninitialized: true,
  saveUninitialized: false,
  name: 'sessionId',
  cookie: {
    secure: false, // only true if you're using HTTPS (Render in production could use true)
    secure: false, // set true in production with HTTPS
    maxAge: 1000 * 60 * 60 * 2 // 2 hours
  }
}));

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});

