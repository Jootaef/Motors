const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const favoriteModel = require("../models/favorite-model")

const invCont = {}

/* ***************************
 * Build inventory by id view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
    try {
        const inv_id = parseInt(req.params.id)
        const data = await invModel.getInventoryById(inv_id)
        
        if (!data || !data.rows || data.rows.length === 0) {
            req.flash("notice", "Vehicle not found")
            return res.redirect("/inv")
        }

        const vehicle = data.rows[0]
        let nav = await utilities.getNav()
        
        // Check if vehicle is in favorites
        let isFavorite = false
        if (res.locals.accountData) {
            try {
                isFavorite = await favoriteModel.isFavorite(
                    res.locals.accountData.account_id,
                    inv_id
                )
            } catch (error) {
                console.error("Error checking favorites:", error)
                // Continue without favorites if there's an error
                isFavorite = false
            }
        }
        
        res.render("./inv/detail", {
            title: `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`,
            nav,
            vehicle,
            isFavorite,
            errors: null,
            accountData: res.locals.accountData || null
        })
    } catch (error) {
        console.error("Error in buildByInventoryId:", error)
        req.flash("notice", "Error loading vehicle details")
        res.redirect("/inv")
    }
}

/* ***************************
 * Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
    try {
        const classification_id = parseInt(req.params.classificationId)
        const data = await invModel.getInventoryByClassificationId(classification_id)
        
        if (!data || !data.rows || data.rows.length === 0) {
            throw new Error("No vehicles found in this classification")
        }

        let nav = await utilities.getNav()
        const className = data.rows[0].classification_name
        
        res.render("./inv/classification", {
            title: className + " vehicles",
            nav,
            grid: data.rows,
            errors: null,
        })
    } catch (error) {
        next(error)
    }
}

/* ***************************
 * Build inventory management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
    try {
        let nav = await utilities.getNav()
        const classificationSelect = await utilities.buildClassificationList()
        res.render("./inv/management", {
            title: "Vehicle Management",
            nav,
            classificationSelect,
            errors: null,
        })
    } catch (error) {
        next(error)
    }
}

/* ***************************
 * Build add classification view
 * ************************** */
invCont.buildNewClassification = async function (req, res, next) {
    try {
        let nav = await utilities.getNav()
        res.render("./inv/add-classification", {
            title: "Add New Classification",
            nav,
            errors: null,
        })
    } catch (error) {
        next(error)
    }
}

/* ***************************
 * Build add inventory view
 * ************************** */
invCont.buildNewVehicle = async function (req, res, next) {
    try {
        let nav = await utilities.getNav()
        let classificationSelect = await utilities.buildClassificationList()
        res.render("./inv/add-inventory", {
            title: "Add New Vehicle",
            nav,
            classificationSelect,
            errors: null,
        })
    } catch (error) {
        next(error)
    }
}

/* ***************************
 * Add new classification
 * ************************** */
invCont.addClassification = async function (req, res, next) {
    try {
        const { classificationName } = req.body
        const result = await invModel.addClassification(classificationName)
        
        if (result) {
            req.flash("notice", `Classification "${classificationName}" was successfully added.`)
            res.redirect("/inv")
        } else {
            req.flash("notice", "Sorry, the classification was not added.")
            res.status(501).render("inv/add-classification", {
                title: "Add New Classification",
                nav: await utilities.getNav(),
                errors: null,
            })
        }
    } catch (error) {
        next(error)
    }
}

/* ***************************
 * Add new inventory item
 * ************************** */
invCont.addVehicle = async function (req, res, next) {
    try {
        const {
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
            classification_id
        } = req.body

        const result = await invModel.addVehicle(
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
            classification_id
        )

        if (result) {
            req.flash("notice", `The ${inv_year} ${inv_make} ${inv_model} was successfully added.`)
            res.redirect("/inv")
        } else {
            req.flash("notice", "Sorry, the vehicle was not added.")
            res.status(501).render("inv/add-inventory", {
                title: "Add New Vehicle",
                nav: await utilities.getNav(),
                classificationSelect: await utilities.buildClassificationList(),
                errors: null,
            })
        }
    } catch (error) {
        next(error)
    }
}

/* ***************************
 * Get inventory as JSON
 * ************************** */
invCont.getInventoryJson = async function (req, res, next) {
    try {
        const classification_id = parseInt(req.params.classificationId)
        const invData = await invModel.getInventoryByClassificationId(classification_id)
        if (invData.rows.length > 0) {
            return res.json(invData.rows)
        } else {
            next(new Error("No data returned"))
        }
    } catch (error) {
        next(error)
    }
}

/* ***************************
 * Build edit inventory view
 * ************************** */
invCont.buildEditVehicle = async function (req, res, next) {
    try {
        const inv_id = parseInt(req.params.vehicleId)
        const data = await invModel.getInventoryById(inv_id)
        let nav = await utilities.getNav()
        const classificationSelect = await utilities.buildClassificationList(data.rows[0].classification_id)
        
        res.render("./inv/edit-inventory", {
            title: "Edit " + data.rows[0].inv_make + " " + data.rows[0].inv_model,
            nav,
            classificationSelect,
            errors: null,
            inv_id: data.rows[0].inv_id,
            inv_make: data.rows[0].inv_make,
            inv_model: data.rows[0].inv_model,
            inv_year: data.rows[0].inv_year,
            inv_description: data.rows[0].inv_description,
            inv_image: data.rows[0].inv_image,
            inv_thumbnail: data.rows[0].inv_thumbnail,
            inv_price: data.rows[0].inv_price,
            inv_miles: data.rows[0].inv_miles,
            inv_color: data.rows[0].inv_color,
            classification_id: data.rows[0].classification_id
        })
    } catch (error) {
        next(error)
    }
}

/* ***************************
 * Update inventory item
 * ************************** */
invCont.updateVehicle = async function (req, res, next) {
    try {
        const {
            inv_id,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
            classification_id
        } = req.body

        const result = await invModel.updateVehicle(
            inv_id,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
            classification_id
        )

        if (result) {
            req.flash("notice", `The ${inv_year} ${inv_make} ${inv_model} was successfully updated.`)
            res.redirect("/inv")
        } else {
            req.flash("notice", "Sorry, the vehicle was not updated.")
            res.status(501).render("inv/edit-inventory", {
                title: "Edit " + inv_make + " " + inv_model,
                nav: await utilities.getNav(),
                classificationSelect: await utilities.buildClassificationList(classification_id),
                errors: null,
                inv_id,
                inv_make,
                inv_model,
                inv_year,
                inv_description,
                inv_image,
                inv_thumbnail,
                inv_price,
                inv_miles,
                inv_color,
                classification_id
            })
        }
    } catch (error) {
        next(error)
    }
}

/* ***************************
 * Build delete inventory view
 * ************************** */
invCont.buildDeleteVehicle = async function (req, res, next) {
    try {
        const inv_id = parseInt(req.params.vehicleId)
        const data = await invModel.getInventoryById(inv_id)
        let nav = await utilities.getNav()
        
        res.render("./inv/delete-inventory", {
            title: "Delete " + data.rows[0].inv_make + " " + data.rows[0].inv_model,
            nav,
            errors: null,
            inv_id: data.rows[0].inv_id,
            inv_make: data.rows[0].inv_make,
            inv_model: data.rows[0].inv_model,
            inv_year: data.rows[0].inv_year,
            inv_price: data.rows[0].inv_price
        })
    } catch (error) {
        next(error)
    }
}

/* ***************************
 * Delete inventory item
 * ************************** */
invCont.deleteVehicle = async function (req, res, next) {
    try {
        const { inv_id, inv_make, inv_model, inv_year } = req.body
        const result = await invModel.deleteVehicle(inv_id)

        if (result) {
            req.flash("notice", `The ${inv_year} ${inv_make} ${inv_model} was successfully deleted.`)
            res.redirect("/inv")
        } else {
            req.flash("notice", "Sorry, the vehicle was not deleted.")
            res.status(501).render("inv/delete-inventory", {
                title: "Delete " + inv_make + " " + inv_model,
                nav: await utilities.getNav(),
                errors: null,
                inv_id,
                inv_make,
                inv_model,
                inv_year
            })
        }
    } catch (error) {
        next(error)
    }
}

/* ***************************
 * Get featured inventory as JSON
 * ************************** */
invCont.getFeaturedJson = async function (req, res, next) {
    try {
        const data = await invModel.getFeatured()
        if (data && data.rows && data.rows.length > 0) {
            return res.json(data.rows)
        } else {
            next(new Error("No featured vehicles found"))
        }
    } catch (error) {
        next(error)
    }
}

/* ***************************
 * Build server error view
 * ************************** */
invCont.buildServerError = function (req, res, next) {
    throw new Error("I'm sorry Dave. I just can't let you do that.")
}

module.exports = invCont
