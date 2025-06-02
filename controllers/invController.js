const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0]?.classification_name || "Vehicles";
  
  res.render("./inventory/classification", {
    title: `${className} vehicles`,
    nav,
    grid,
  });
};
invCont.buildByInventoryId = async function (req, res, next) {
  const inv_id = req.params.inv_id;
  const data = await invModel.getInventoryById(inv_id);
  const vehicle = data[0];

  if (!vehicle) {
    return res.status(404).send("Vehicle not found");
  }

  const nav = await utilities.getNav();

  res.render("./inventory/detail", {
    title: `${vehicle.inv_make} ${vehicle.inv_model}`,
    nav,
    vehicle, 
  });
};

module.exports = invCont;
