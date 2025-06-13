const pool = require('../database/')

const updates = [
  { email: 'basic@340.edu', type: 'Employee' },
  { email: 'happy@340.edu', type: 'Employee' },
  { email: 'manager@340.edu', type: 'Admin' },
  { email: 'admin@cse340.net', type: 'Admin' },
  { email: 'sally@jones.com', type: 'Client' },
  { email: 'jaydan@gmail.com', type: 'Admin' },
  { email: 'paulo@gmail.com', type: 'Admin' },
]

async function updateAccountType(email, newType) {
    try {
        // Verificar que el tipo de cuenta sea válido
        const validTypes = ['Client', 'Employee', 'Admin']
        if (!validTypes.includes(newType)) {
            throw new Error('Invalid account type. Must be one of: Client, Employee, Admin')
        }

        // Actualizar el tipo de cuenta usando el tipo enum
        const sql = `
            UPDATE account 
            SET account_type = $1,
                account_updated_at = CURRENT_TIMESTAMP
            WHERE account_email = $2
            RETURNING *`
        
        const result = await pool.query(sql, [newType, email])
        
        if (result.rowCount === 0) {
            console.log(`No account found with email: ${email}`)
            return null
        }
        
        console.log(`Account type updated successfully for ${email} to ${newType}`)
        return result.rows[0]
    } catch (error) {
        console.error('Error updating account type:', error)
        throw error
    }
}

// Ejecutar todas las actualizaciones
if (require.main === module) {
    (async () => {
        for (const { email, type } of updates) {
            try {
                await updateAccountType(email, type)
            } catch (err) {
                console.error(`Error updating ${email}:`, err.message)
            }
        }
        process.exit()
    })()
}

module.exports = { updateAccountType } 