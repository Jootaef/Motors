const pool = require("../database/");

/* ***************************
 *  Get all classification data
 *  Returns a list of classifications sorted by name
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name");
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
   // Query all classifications from the database
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows;
  } catch (error) {
    // Catch and log the error if DB connection fails
    console.error("getclassificationsbyid error " + error)
    return [];
  }
};

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}

// Export the functions so they can be used elsewhere
module.exports = {getClassifications, getInventoryByClassificationId, checkExistingEmail};