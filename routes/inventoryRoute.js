// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const invValidate = require("../utilities/inventory-validation")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId)

// Route for viewing vehicles by inventory id
router.get("/detail/:invId", invController.buildDetailView)

// Route to build the inventory management view
router.get("/", invController.buildManagementView)

// Route to deliver add classification form
router.get("/add-classification", invController.buildAddClassification)

// Proccess the add classification data
router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  invController.addClassification
)

// Route to deliver add inventory form
router.get("/add-inventory", invController.buildAddInventory)

// Proccess the add inventory data
router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  invController.addInventory
)

module.exports = router