const pool = require('../database/')

async function registerAccount(firstName, lastName, email, password) {
    try {
        const sql = `
            INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type)
            VALUES ($1, $2, $3, $4, 'Client')
            RETURNING *`
        const result = await pool.query(sql, [firstName, lastName, email, password])
        return result.rows[0]
    } catch (error) {
        console.error('Error in registerAccount:', error)
        throw error
    }
}

async function checkExistingEmail(email) {
    try {
        const sql = `
            SELECT *
            FROM account
            WHERE account_email = $1`
        const result = await pool.query(sql, [email])
        return result.rowCount
    } catch (error) {
        console.error('Error in checkExistingEmail:', error)
        throw error
    }
}

async function checkExistingEmailWithAccount(accountId, email) {
    try {
        const sql = `
            SELECT *
            FROM account
            WHERE account_email = $1
              AND account_id != $2`
        const result = await pool.query(sql, [email, accountId])
        return result.rowCount
    } catch (error) {
        console.error('Error in checkExistingEmailWithAccount:', error)
        throw error
    }
}

async function getAccountByEmail(email) {
    try {
        const result = await pool.query(
            `SELECT *
             FROM account
             WHERE account_email = $1`,
            [email])
        return result.rows[0]
    } catch (error) {
        console.error('Error in getAccountByEmail:', error)
        throw error
    }
}

async function getAccountById(id) {
    try {
        const result = await pool.query(
            `SELECT *
             FROM account
             WHERE account_id = $1`,
            [id])
        return result.rows[0]
    } catch (error) {
        console.error('Error in getAccountById:', error)
        throw error
    }
}

async function updateAccount(id, firstName, lastName, email) {
    try {
        const result = await pool.query(
            `UPDATE account
             SET account_firstname = $1,
                 account_lastname  = $2,
                 account_email     = $3,
                 account_updated_at = CURRENT_TIMESTAMP
             WHERE account_id = $4
             RETURNING *`,
            [firstName, lastName, email, id])
        return result.rows[0]
    } catch (error) {
        console.error('Error in updateAccount:', error)
        throw error
    }
}

async function changePassword(id, password) {
    try {
        const result = await pool.query(
            `UPDATE account
             SET account_password = $2,
                 account_updated_at = CURRENT_TIMESTAMP
             WHERE account_id = $1
             RETURNING *`,
            [id, password])
        return result.rows[0]
    } catch (error) {
        console.error('Error in changePassword:', error)
        throw error
    }
}

module.exports = {
    registerAccount,
    checkExistingEmail,
    checkExistingEmailWithAccount,
    getAccountByEmail,
    getAccountById,
    updateAccount,
    changePassword,
}