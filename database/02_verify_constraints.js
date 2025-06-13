const pool = require('../database/')

async function verifyAndAddConstraints() {
    try {
        // Verificar si la restricción única existe
        const checkConstraint = await pool.query(`
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE table_name = 'account' 
            AND constraint_type = 'UNIQUE' 
            AND constraint_name = 'account_email_unique'
        `)

        if (checkConstraint.rowCount === 0) {
            console.log('Agregando restricción única a account_email...')
            // Agregar la restricción única
            await pool.query(`
                ALTER TABLE account
                ADD CONSTRAINT account_email_unique UNIQUE (account_email)
            `)
            console.log('Restricción única agregada exitosamente')
        } else {
            console.log('La restricción única ya existe en account_email')
        }

        // Verificar si la validación de email existe
        const checkEmailValidation = await pool.query(`
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE table_name = 'account' 
            AND constraint_type = 'CHECK' 
            AND constraint_name = 'account_email_check'
        `)

        if (checkEmailValidation.rowCount === 0) {
            console.log('Agregando validación de formato de email...')
            // Agregar la validación de email
            await pool.query(`
                ALTER TABLE account
                ADD CONSTRAINT account_email_check CHECK (
                    account_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
                )
            `)
            console.log('Validación de email agregada exitosamente')
        } else {
            console.log('La validación de email ya existe')
        }

    } catch (error) {
        console.error('Error al verificar/agregar restricciones:', error)
    } finally {
        // Cerrar la conexión
        await pool.end()
    }
}

// Ejecutar la función
verifyAndAddConstraints() 