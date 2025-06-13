const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const controller = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
controller.buildByClassificationId = async function (req, res) {
    const classification_id = req.params.classificationId
    const classification = await invModel.getClassificationById(classification_id)
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = classification.classification_name
    res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        grid,
    })
}

/* ***************************
 *  Build item by inventory id view
 * ************************** */
controller.buildByInventoryId = async function (req, res, next) {
    const id = req.params.id
    const vehicle = await invModel.getInventoryById(id)
    if (!vehicle) {
        const error = new Error("I'm sorry! I could not find that vehicle. Are you trying to hack me? I will find you and your mother if you are.")
        error.status = 404;
        return next(error)
    }
    const detail = await utilities.buildByInventoryId(vehicle)
    let nav = await utilities.getNav()
    res.render("./inventory/item", {
        title: `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`,
        nav,
        detail: detail,
    })
}

controller.buildManagement = async function (req, res) {
    let nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList()
    res.render("./inventory/management", {
        title: 'Vehicle Management',
        nav,
        errors: null,
        classificationSelect
    })
}

controller.buildNewClassification = async function (req, res) {
    let nav = await utilities.getNav()
    res.render("./inventory/add-classification", {
        title: 'Add Classification',
        nav,
        errors: null,
    })
}

controller.addClassification = async function (req, res) {
    const {
        classificationName,
    } = req.body

    const result = await invModel.addClassification(classificationName)
    let nav = await utilities.getNav()

    if (result) {
        req.flash('notice', `Classification ${classificationName} has been added successfully.`)
        res.status(201).render('inventory/management', {
            title: 'Vehicle Management',
            nav,
            errors: null,
        })
    } else {
        req.flash('notice', 'Failed to create the classification.')
        res.status(501).render('inventory/add-classification', {
            title: 'Add Classification',
            nav,
            errors: null,
        })
    }
}

controller.addVehicle = async function (req, res) {
    const {
        year,
        make,
        model,
        description,
        image,
        thumbnail,
        price,
        miles,
        color,
        isFeatured,
        classificationId,
    } = req.body

    const result = await invModel.addVehicle(
        year,
        make,
        model,
        description,
        image,
        thumbnail,
        price,
        miles,
        color,
        isFeatured,
        classificationId,
    )

    let nav = await utilities.getNav()
    let classifications = await utilities.buildClassificationList()

    if (result) {
        req.flash('notice', `${year} ${make} ${model} has been added successfully`)
        res.status(201).render('inventory/management', {
            title: 'Vehicle Management',
            nav,
            classificationSelect: classifications,
            errors: null,
        })
    } else {
        req.flash('notice', 'Failed to create the vehicle')
        res.status(501).render('inventory/add-inventory', {
            title: 'Add Vehicle',
            nav,
            classifications,
            errors: null,
        })
    }
}

controller.buildNewVehicle = async function (req, res) {
    let nav = await utilities.getNav()
    let classifications = await utilities.buildClassificationList()
    res.render("./inventory/add-inventory", {
        title: 'Add Vehicle',
        nav,
        classifications,
        errors: null,
    })
}

controller.getInventoryJson = async (req, res, next) => {
    const classificationId = parseInt(req.params.classificationId)
    const invData = await invModel.getInventoryByClassificationId(classificationId)
    if (invData.length === 0 || invData[0].inv_id) {
        return res.json(invData)
    } else {
        next(newError('No data returned'))
    }
}

controller.buildEditVehicle = async (req, res) => {
    let nav = await utilities.getNav()

    const vehicleId = parseInt(req.params.vehicleId)
    const vehicle = await invModel.getInventoryById(vehicleId)
    let classifications = await utilities.buildClassificationList(vehicle.classification_id)

    res.render('./inventory/edit-vehicle', {
        title: `Edit ${vehicle.inv_make} ${vehicle.inv_model}`,
        nav,
        classifications,
        errors: null,
        id: vehicle.inv_id,
        make: vehicle.inv_make,
        model: vehicle.inv_model,
        year: vehicle.inv_year,
        description: vehicle.inv_description,
        image: vehicle.inv_image,
        thumbnail: vehicle.inv_thumbnail,
        price: vehicle.inv_price,
        miles: vehicle.inv_miles,
        color: vehicle.inv_color,
        isFeatured: vehicle.is_featured,
        classificationId: vehicle.classification_id
    })
}

controller.updateVehicle = async (req, res) => {
    const {
        id,
        year,
        make,
        model,
        description,
        image,
        thumbnail,
        price,
        miles,
        color,
        isFeatured,
        classificationId,
    } = req.body

    const result = await invModel.updateVehicle(
        id,
        year,
        make,
        model,
        description,
        image,
        thumbnail,
        price,
        miles,
        color,
        isFeatured,
        classificationId,
    )

    if (result) {
        req.flash('notice', `${year} ${make} ${model} has been updated`)
        res.redirect('/inv/')
    } else {
        let nav = await utilities.getNav()
        let classifications = await utilities.buildClassificationList(classificationId)

        req.flash('notice', 'Failed to update the vehicle')
        res.status(501).render('inventory/edit-vehicle', {
            title: `Update ${make} ${model}`,
            nav,
            classifications,
            errors: null,
            id,
            year,
            make,
            model,
            description,
            image,
            thumbnail,
            price,
            miles,
            color,
            classificationId,
        })
    }
}

controller.buildDeleteVehicle = async (req, res) => {
    let nav = await utilities.getNav()

    const vehicleId = parseInt(req.params.vehicleId)
    const vehicle = await invModel.getInventoryById(vehicleId)
    let classifications = await utilities.buildClassificationList(vehicle.classification_id)

    res.render('./inventory/delete-vehicle', {
        title: `Delete ${vehicle.inv_make} ${vehicle.inv_model}`,
        nav,
        classifications,
        errors: null,
        id: vehicle.inv_id,
        make: vehicle.inv_make,
        model: vehicle.inv_model,
        year: vehicle.inv_year,
        price: vehicle.inv_price,
    })
}

controller.deleteVehicle = async (req, res) => {
    const {
        id,
        year,
        make,
        model,
        price,
    } = req.body

    const result = await invModel.deleteVehicle(id)

    if (result) {
        req.flash('notice', `${year} ${make} ${model} has been deleted`)
        res.redirect('/inv/')
    } else {
        let nav = await utilities.getNav()
        let classifications = await utilities.buildClassificationList(classificationId)

        req.flash('notice', 'Failed to delete the vehicle')
        res.status(501).render('inventory/delete-vehicle', {
            title: `Delete ${make} ${model}`,
            nav,
            classifications,
            errors: null,
            id,
            year,
            make,
            model,
            price,
        })
    }
}

controller.getFeaturedJson = async (req, res, next) => {
    const invData = await invModel.getFeatured()
    if (invData.length === 0 || invData[0].inv_id) {
        return res.json(invData)
    } else {
        next(newError('No data returned'))
    }
}

controller.buildServerError = () => {
    throw new Error("I'm sorry Dave. I just can't let you do that.")
}

module.exports = controller
