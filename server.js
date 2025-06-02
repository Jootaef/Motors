// Load environment variables from .env file
const env = require("dotenv").config();

// Core imports
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const app = express();

// Session and database session store
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const pool = require("./database/");

// Flash messages
const flash = require("connect-flash");

// Application routes and utilities
const static = require("./routes/static");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const accountRoute = require("./routes/accountRoute");
const utilities = require("./utilities/");

// ----------- MIDDLEWARE CONFIGURATION ----------- //

// Configure session middleware with PostgreSQL session store
app.use(
  session({
    store: new pgSession({
      createTableIfMissing: true,
      pool,
    }),
    secret: process.env.SESSION_SECRET || "fallbackSecret123",
    resave: false,
    saveUninitialized: false,
    name: "sessionId",
    cookie: {
      secure: false, // Set to true if using HTTPS
      maxAge: 1000 * 60 * 60 * 2, // Session duration: 2 hours
    },
  })
);

// Flash message support
app.use(flash());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

// Set EJS as the view engine and layout system
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // Default layout

// Serve static files (CSS, images, JS, etc.) from the "public" folder
app.use(express.static("public"));

// ----------- ROUTES ----------- //

// Home route
app.get("/", utilities.handleErrors(baseController.buildHome));

// Inventory-related routes
app.use("/inv", inventoryRoute);

// Account-related routes (login, register, etc.)
app.use("/account", accountRoute);

// ----------- ERROR HANDLING ----------- //
/* ===== 404 Handler ===== */
app.use((req, res, next) => {
  next({ status: 404, message: "Page not found." });
});

/* ===== General Error Handler ===== */
app.use(async (err, req, res, next) => {
  const nav = await utils.getNav();
  const status = err.status || 500;
  const message =
    status === 404
      ? err.message
      : `Error ${status}: Something went wrong on the server.`;

  res.status(status).render("errors/error", {
    title: `Error ${status}`,
    message,
    nav,
  });
});


// ----------- START SERVER ----------- //

const port = process.env.PORT || 5501;
const host = process.env.HOST || "localhost";

app.listen(port, () => {
  console.log(`App listening at http://${host}:${port}`);
});
