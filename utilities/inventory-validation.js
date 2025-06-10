const utilities = require(".")
const { body, validationResult } = require("express-validator")

const validate = {}

/* ******************************
 *  Classification Validation Rules
 * ***************************** */
validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .notEmpty()
      .withMessage("Please provide a classification name.")
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage("Classification name cannot contain spaces or special characters."),
  ]
}

/* ******************************
 *  Inventory Validation Rules
 * ***************************** */
validate.inventoryRules = () => {
  return [
    body("classification_id")
      .notEmpty()
      .withMessage("Please select a classification."),
    body("inv_make")
      .trim()
      .notEmpty()
      .withMessage("Please provide the vehicle make."),
    body("inv_model")
      .trim()
      .notEmpty()
      .withMessage("Please provide the vehicle model."),
    body("inv_year")
      .notEmpty()
      .isInt({ min: 1900, max: 2100 })
      .withMessage("Please provide a valid year between 1900 and 2100."),
    body("inv_description")
      .trim()
      .notEmpty()
      .withMessage("Please provide a description."),
    body("inv_image")
      .trim()
      .notEmpty()
      .withMessage("Please provide an image path."),
    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Please provide a thumbnail path."),
    body("inv_price")
      .notEmpty()
      .isFloat({ min: 0 })
      .withMessage("Please provide a valid price."),
    body("inv_miles")
      .notEmpty()
      .isInt({ min: 0 })
      .withMessage("Please provide a valid mileage."),
    body("inv_color")
      .trim()
      .notEmpty()
      .withMessage("Please provide a color."),
  ]
}

/* ******************************
 * Check classification data
 * ***************************** */
validate.checkClassificationData = async (req, res, next) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      errors: errors.array(),
      title: "Add Classification",
      nav,
      classification_name: req.body.classification_name,
    })
    return
  }
  next()
}

/* ******************************
 * Check Inventory Data
 * ***************************** */
validate.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    res.render("inventory/add-inventory", {
      errors: errors.array(),
      title: "Add Inventory",
      nav,
      data: req.body,
    });
    return
  }
  next()
}

/* ******************************
 * Check Edit/Update Data
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList(req.body.classification_id)

    res.render("inventory/update-inventory", {
      title: `Update ${req.body.inv_make} ${req.body.inv_model}`,
      nav,
      classificationSelect,
      errors: errors.array(),
      inv_id: req.body.inv_id,
      inv_make: req.body.inv_make,
      inv_model: req.body.inv_model,
      inv_year: req.body.inv_year,
      inv_description: req.body.inv_description,
      inv_image: req.body.inv_image,
      inv_thumbnail: req.body.inv_thumbnail,
      inv_price: req.body.inv_price,
      inv_miles: req.body.inv_miles,
      inv_color: req.body.inv_color,
      classification_id: req.body.classification_id,
    })
    return
  }
  next()
}

module.exports = validate