const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

async function getClassificationById(id) {
    try {
        const data = await pool.query(
            `SELECT *
             FROM public.classification
             WHERE classification_id = $1`,
            [id]
        )
        return data.rows[0]
    } catch (error) {
        console.error("getclassificationsbyid error", error)
    }
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
    try {
        const data = await pool.query(
            `SELECT *
             FROM public.inventory AS i
                      JOIN public.classification AS c
                           ON i.classification_id = c.classification_id
             WHERE i.classification_id = $1`,
            [classification_id]
        )
        return data
    } catch (error) {
        console.error("getinventorybyclassificationid error " + error)
        throw error
    }
}

/* ***************************
 *  Get inventory item by id
 * ************************** */
async function getInventoryById(id) {
    try {
        const data = await pool.query(
            `SELECT i.*, c.classification_name
             FROM public.inventory AS i
             JOIN public.classification AS c ON i.classification_id = c.classification_id
             WHERE i.inv_id = $1`,
            [id]
        )
        return data;
    } catch (error) {
        console.error("getInventoryById error:", error);
        throw error;
    }
}

async function checkClassificationExists(name) {
    try {
        const sql = `
            SELECT *
            FROM classification
            WHERE classification_name = $1`
        const result = await pool.query(sql, [name])
        return result.rowCount
    } catch (error) {
        return error.message
    }
}

async function addClassification(name) {
    try {
        const sql = `
            INSERT INTO classification (classification_name)
            VALUES ($1)
            RETURNING *`
        return await pool.query(sql, [name])
    } catch (error) {
        return error.message
    }
}

async function addVehicle(year,
                          make,
                          model,
                          description,
                          image,
                          thumbnail,
                          price,
                          miles,
                          color,
                          classificationId
) {
    try {
        const sql = `
            INSERT INTO inventory (inv_make,
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
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *`
        return await pool.query(sql, [
            make,
            model,
            year,
            description,
            image,
            thumbnail,
            price,
            miles,
            color,
            parseInt(classificationId)
        ])
    } catch (error) {
        return error.message
    }
}

async function updateVehicle(id,
                             year,
                             make,
                             model,
                             description,
                             image,
                             thumbnail,
                             price,
                             miles,
                             color,
                             classificationId
) {
    try {
        const sql = `
            UPDATE inventory
            SET inv_make          = $1,
                inv_model         = $2,
                inv_year          = $3,
                inv_description   = $4,
                inv_image         = $5,
                inv_thumbnail     = $6,
                inv_price         = $7,
                inv_miles         = $8,
                inv_color         = $9,
                classification_id = $10            
            WHERE inv_id = $11
            RETURNING *`
        const data = await pool.query(sql, [
            make,
            model,
            year,
            description,
            image,
            thumbnail,
            price,
            miles,
            color,
            parseInt(classificationId),
            parseInt(id)
        ])
        return data.rows[0]
    } catch (error) {
        console.error("update vehicle model error: " + error)
        throw error
    }
}

async function deleteVehicle(id) {
    try {
        const sql = `
            DELETE FROM inventory
            WHERE inv_id = $1
            RETURNING *`
        return await pool.query(sql, [parseInt(id)])
    } catch (error) {
        console.error("delete vehicle model error: " + error)
    }
}

async function getFeatured() {
    try {
        const data = await pool.query(
            `SELECT *
             FROM public.inventory AS i
                      JOIN public.classification AS c
                           ON i.classification_id = c.classification_id
             LIMIT 3`
        )
        return data
    } catch (error) {
        console.error("getFeatured error " + error)
        throw error
    }
}



module.exports = {
    getClassifications,
    getInventoryByClassificationId,
    getInventoryById,
    checkClassificationExists,
    addClassification,
    getClassificationById,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    getFeatured,
}