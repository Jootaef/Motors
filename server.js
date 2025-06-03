
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const utilities = require("./utilities/")
const session = require("express-session")
const pool = require('./database/')
const accountRoute = require('./routes/accountRoute')
const bodyParser = require("body-parser")


app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) 


app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})


app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")


app.use(express.static('public'));
app.use(static)


app.get("/", utilities.handleErrors(baseController.buildHome))

app.use("/inv", inventoryRoute)

app.use('/account', accountRoute)


app.get('/error', (req, res, next) => {
  const err = new Error('Testing for Error Status 500')
  err.status = 500
  next(err)
});

app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'})
})


app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  let message
  if (err.status == 404) { message = err.message } else { message = 'Oh no! There was a crash. Maybe try a different route?' }
  res.status(err.status || 500).render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  })
})


const port = process.env.PORT || 5500
const host = process.env.HOST || 'localhost'


app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})