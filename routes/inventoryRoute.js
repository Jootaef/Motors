// Needed Resources
const express = require("express")
const router = new express.Router()
const controller = require("../controllers/invController")
const validator = require("../utilities/inventory-validation");
const utilities = require("../utilities");


router.get("/", utilities.canAdminister, controller.buildManagement);
router.get("/type/:classificationId", controller.buildByClassificationId);
router.get("/detail/:id", controller.buildByInventoryId);

router.get("/classification", utilities.canAdminister, controller.buildNewClassification);
router.post('/classification',
    utilities.canAdminister,
    validator.classificationRules(),
    validator.classificationDataCheck,
    utilities.handleErrors(controller.addClassification)
)

router.get("/vehicle", utilities.canAdminister, controller.buildNewVehicle);
router.post('/vehicle',
    utilities.canAdminister,
    validator.vehicleRules(),
    validator.vehicleDataCheck,
    utilities.handleErrors(controller.addVehicle)
)

router.get("/getInventory/:classificationId", utilities.handleErrors(controller.getInventoryJson))

router.get("/edit/:vehicleId", utilities.canAdminister, utilities.handleErrors(controller.buildEditVehicle))
router.post("/update",
    utilities.canAdminister,
    validator.vehicleRules(),
    validator.updateVehicleDataCheck,
    utilities.handleErrors(controller.updateVehicle)
)

router.get('/delete/:vehicleId', utilities.canAdminister, utilities.handleErrors(controller.buildDeleteVehicle))
router.post("/delete", utilities.canAdminister, utilities.handleErrors(controller.deleteVehicle))

router.get("/getFeatured", utilities.handleErrors(controller.getFeaturedJson))

router.get("/server-error", controller.buildServerError);

module.exports = router;
