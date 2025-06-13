const pool = require('../database/')

async function checkTableStructure() {
    try {
        // Obtener información de las columnas
        const columns = await pool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'account'
            ORDER BY ordinal_position
        `)
        console.log('\nColumnas de la tabla account:')
        console.log(columns.rows)

        // Obtener información de las restricciones
        const constraints = await pool.query(`
            SELECT tc.constraint_name, tc.constraint_type, kcu.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
                ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_name = 'account'
        `)
        console.log('\nRestricciones de la tabla account:')
        console.log(constraints.rows)

    } catch (error) {
        console.error('Error al verificar la estructura de la tabla:', error)
    }
}

// Ejecutar la función
checkTableStructure() 