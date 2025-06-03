const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const invController = require("../controllers/invController")

const invCont = {}


invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}


invCont.buildDetailView = async function (req, res, next) {
  const invId = req.params.invId
  try {
    const vehicle = await invModel.getVehicleById(invId)
    const detailHtml = utilities.buildDetailView(vehicle)
    const nav = await utilities.getNav()
    const title = `${vehicle.inv_make} ${vehicle.inv_model}`
    res.render("inventory/inventory-detail", {
      title,
      nav,
      detailHtml
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Manage inventory by management view
 * ************************** */
invCont.buildManagementView = async function (req, res) {
  const nav = await utilities.getNav()
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    errors: null,
  })
}

/* ***************************
 *  Build add classification in inventory
 * ************************** */
invCont.buildAddClassification = async function (req, res) {
  const nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
  })
}

/* ***************************
 *  Add classification in inventory
 * ************************** */
invCont.addClassification = async function (req, res) {
  let nav = await utilities.getNav()
  const { classification_name } = req.body

  try {
    const result = await invModel.addClassification(classification_name)
    if (result) {
      req.flash("notice", `Classification "${classification_name}" added successfully.`)
      res.redirect("/inv")
    } else {
      req.flash("notice", "Failed to add classification.")
      res.status(500).render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        errors: null
      })
    }
  } catch (error) {
    req.flash("notice", "Error: Classification might already exist.")
    res.status(500).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null
    })
  }
}

/* ***************************
 *  Build Add Inventory
 * ************************** */
invCont.buildAddInventory = async function (req, res) {
  const nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()

  res.render("inventory/add-inventory", {
    title: "Add New Inventory",
    nav,
    classificationList,
    errors: null,
  })
}

/* ***************************
 *  Add Inventory
 * ************************** */
invCont.addInventory = async function (req, res) {
  console.log("Form data:", req.body)
  const nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
  } = req.body

  try {
    const result = await invModel.addInventory(
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color
    )

    if (result) {
      req.flash("notice", `Inventory item "${inv_make} ${inv_model}" added successfully.`)
      res.redirect("/inv")
    } else {
      req.flash("notice", "Failed to add inventory item.")
      res.status(500).render("inventory/add-inventory", {
        title: "Add New Inventory",
        nav,
        classificationList,
        errors: null,
        data: req.body,
      })
    }
  } catch (error) {
    req.flash("notice", "Error: Could not add inventory item.")
    res.status(500).render("inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationList,
      errors: null,
      data: req.body,
    })
  }
}

module.exports = invCont