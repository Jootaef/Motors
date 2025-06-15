const pool = require('../database/')

/* ***************************
 * Get all favorites for an account
 * ************************** */
async function getFavoritesByAccountId(account_id) {
    try {
        const sql = `
            SELECT f.*, i.inv_make, i.inv_model, i.inv_year, i.inv_price, i.inv_image, i.inv_thumbnail
            FROM favorites f
            JOIN inventory i ON f.inventory_id = i.inv_id
            WHERE f.account_id = $1
            ORDER BY f.favorite_date DESC`
        return await pool.query(sql, [account_id])
    } catch (error) {
        console.error('Error in getFavoritesByAccountId:', error)
        throw error
    }
}

/* ***************************
 * Add a vehicle to favorites
 * ************************** */
async function addFavorite(account_id, inventory_id) {
    try {
        const sql = 'INSERT INTO favorites (account_id, inventory_id) VALUES ($1, $2) RETURNING *'
        return await pool.query(sql, [account_id, inventory_id])
    } catch (error) {
        console.error('Error in addFavorite:', error)
        throw error
    }
}

/* ***************************
 * Remove a vehicle from favorites
 * ************************** */
async function removeFavorite(account_id, inventory_id) {
    try {
        const sql = 'DELETE FROM favorites WHERE account_id = $1 AND inventory_id = $2 RETURNING *'
        return await pool.query(sql, [account_id, inventory_id])
    } catch (error) {
        console.error('Error in removeFavorite:', error)
        throw error
    }
}

/* ***************************
 * Check if a vehicle is in favorites
 * ************************** */
async function isFavorite(account_id, inventory_id) {
    try {
        const sql = 'SELECT * FROM favorites WHERE account_id = $1 AND inventory_id = $2'
        const result = await pool.query(sql, [account_id, inventory_id])
        return result.rowCount > 0
    } catch (error) {
        console.error('Error in isFavorite:', error)
        throw error
    }
}

module.exports = {
    getFavoritesByAccountId,
    addFavorite,
    removeFavorite,
    isFavorite
} 