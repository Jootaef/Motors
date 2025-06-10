const pool = require("../database/")
const bcrypt = require("bcryptjs")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

/* ***************************
 *   Select vehicle by the inventory ID
 * ************************** */
async function getVehicleById(inv_id) {
  try {
    const result = await pool.query(
      `SELECT * FROM public.inventory WHERE inv_id = $1`,
      [inv_id]
    )
    return result.rows[0]
  } catch (error) {
    throw new Error("Database error: " + error)
  }
}

/* ***************************
 *  Add a new classification
 * ************************** */
async function addClassification(classification_name) {
  try {
    const sql = `INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *`;
    const result = await pool.query(sql, [classification_name]);
    return result.rows[0];
  } catch (error) {
    throw new Error("Database insert error: " + error);
  }
}

/* ***************************
 *  Add a new inventory item
 * ************************** */
async function addInventory(
  classification_id,
  inv_make,
  inv_model,
  inv_year,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_miles,
  inv_color
) {
  try {
    const sql = `
      INSERT INTO public.inventory (
        classification_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `
    const result = await pool.query(sql, [
      parseInt(classification_id),
      inv_make,
      inv_model,
      parseInt(inv_year),
      inv_description,
      inv_image,
      inv_thumbnail,
      parseFloat(inv_price),
      parseInt(inv_miles),
      inv_color,
    ])
    return result.rows[0]
  } catch (error) {
    console.error("Insert inventory error:", error)
    throw error
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
  inv_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}

/* ***************************
 *  Get account by email
 * ************************** */
async function getAccountByEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

/* ***************************
 *  Get account by ID
 * ************************** */
async function getAccountById(account_id) {
  try {
    const sql = "SELECT * FROM account WHERE account_id = $1"
    const account = await pool.query(sql, [account_id])
    return account.rows[0]
  } catch (error) {
    return new Error("No matching account found")
  }
}

/* ***************************
 *  Register new account
 * ************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
  } catch (error) {
    return new Error("Registration failed")
  }
}

/* ***************************
 *  Update account information
 * ************************** */
async function updateAccount(account_id, first_name, last_name, email) {
  try {
    const sql = "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *"
    const result = await pool.query(sql, [first_name, last_name, email, account_id])
    return result.rows[0]
  } catch (error) {
    return new Error("Update failed")
  }
}

/* ***************************
 *  Update account password
 * ************************** */
async function updatePassword(account_id, hashedPassword) {
  try {
    const sql = "UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING *"
    const result = await pool.query(sql, [hashedPassword, account_id])
    return result.rows[0]
  } catch (error) {
    return new Error("Password update failed")
  }
}

/* ***************************
 *  Get all accounts
 * ************************** */
async function getAllAccounts() {
  try {
    const sql = "SELECT account_id, account_firstname, account_lastname, account_email, account_type FROM account ORDER BY account_id"
    const accounts = await pool.query(sql)
    return accounts.rows
  } catch (error) {
    return new Error("Error getting accounts")
  }
}

module.exports = { 
  getClassifications, 
  getInventoryByClassificationId, 
  getVehicleById, 
  addClassification, 
  addInventory, 
  updateInventory, 
  getAccountByEmail, 
  getAccountById, 
  registerAccount, 
  updateAccount, 
  updatePassword,
  getAllAccounts 
}