const utilities = require('.')
const {body, validationResult} = require('express-validator')
const validator = {}
const invModel = require('../models/inventory-model')

validator.classificationRules = () => {
    return [
        body('classificationName')
            .trim()
            .matches(/^[a-zA-Z]+$/)
            .withMessage('Please provide a valid classification name (letters only)')
            .custom(async(name) => {
                const exists = await invModel.checkClassificationExists(name)
                if (exists) {
                    throw new Error('Classification already exists')
                }
            }),
    ]
}

validator.classificationDataCheck = async (req, res, next) => {
    const {
        classificationName,
    } = req.body

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render('inventory/add-classification', {
            errors,
            title: 'Add Classification',
            nav,
            classificationName,
        })
        return
    }
    next()
}

validator.vehicleRules = () => {
    return [
        body('year')
            .trim()
            .isNumeric()
            .matches(/^(19|20)\d{2}$/)
            .withMessage('Please provide a valid year (yyyy)'),
        body('make')
            .trim()
            .isLength({min: 1})
            .withMessage('Please provide a make (ex: Ford)'),
        body('model')
            .trim()
            .isLength({min: 1})
            .withMessage('Please provide a model (ex: Mustang'),
        body('description')
            .trim()
            .isLength({min: 1})
            .withMessage('Please provide a description'),
        body('image')
            .trim()
            .matches(/^\/images\/vehicles\/.+$/)
            .withMessage('Please provide a valid image path (ex: /images/vehicles/75-ford-f150.png)'),
        body('thumbnail')
            .trim()
            .matches(/^\/images\/vehicles\/.+$/)
            .withMessage('Please provide a valid image thumbnail path (ex: /images/vehicles/75-ford-f150-tn.png)'),
        body('price')
            .trim()
            .isNumeric()
            .withMessage('Please provide a price (no punctuation)'),
        body('miles')
            .trim()
            .isNumeric()
            .withMessage('Please provide the odometer miles (no punctuation)'),
        body('color')
            .trim()
            .isLength({min: 1})
            .withMessage('Please provide a color (ex: Red)'),
        body('classificationId')
            .trim()
            .isLength({min: 1})
            .withMessage('Please provide a valid classification')
            .custom(async(id) => {
                if (!id || id === '') {
                    return false;
                }
                const found = await invModel.getClassificationById(id)
                return !!found;
            }),
    ]
}

validator.vehicleDataCheck = async (req, res, next) => {
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

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        let classifications = await utilities.buildClassificationList(classificationId)

        res.render('inventory/add-inventory', {
            errors,
            title: 'Add Vehicle',
            nav,
            classifications,
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
        })
        return
    }
    next()
}

validator.updateVehicleDataCheck = async (req, res, next) => {
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

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        let classifications = await utilities.buildClassificationList(classificationId)

        res.render('inventory/edit-vehicle', {
            errors,
            title: `Edit ${make} ${model}`,
            nav,
            classifications,
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
        })
        return
    }
    next()
}

module.exports = validator