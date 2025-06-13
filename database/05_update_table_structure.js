const pool = require('../database/')

async function updateTableStructure() {
    try {
        // Renombrar las columnas
        console.log('Renombrando columnas...')
        await pool.query(`
            ALTER TABLE account
            RENAME COLUMN first_name TO account_firstname;
            
            ALTER TABLE account
            RENAME COLUMN last_name TO account_lastname;
            
            ALTER TABLE account
            RENAME COLUMN email TO account_email;
            
            ALTER TABLE account
            RENAME COLUMN password TO account_password;
        `)
        console.log('Columnas renombradas exitosamente')

        // Eliminar la restricción única existente
        console.log('Eliminando restricción única existente...')
        await pool.query(`
            ALTER TABLE account
            DROP CONSTRAINT account_email_key;
        `)
        console.log('Restricción única eliminada exitosamente')

        // Agregar la nueva restricción única
        console.log('Agregando nueva restricción única...')
        await pool.query(`
            ALTER TABLE account
            ADD CONSTRAINT account_email_unique UNIQUE (account_email);
        `)
        console.log('Nueva restricción única agregada exitosamente')

        // Agregar la validación de email
        console.log('Agregando validación de formato de email...')
        await pool.query(`
            ALTER TABLE account
            ADD CONSTRAINT account_email_check CHECK (
                account_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
            );
        `)
        console.log('Validación de email agregada exitosamente')

        // Agregar columnas de timestamp si no existen
        console.log('Verificando columnas de timestamp...')
        const checkTimestamp = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'account' 
            AND column_name = 'account_created_at'
        `)

        if (checkTimestamp.rowCount === 0) {
            console.log('Agregando columnas de timestamp...')
            await pool.query(`
                ALTER TABLE account
                ADD COLUMN account_created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                ADD COLUMN account_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
            `)
            console.log('Columnas de timestamp agregadas exitosamente')
        } else {
            console.log('Las columnas de timestamp ya existen')
        }

    } catch (error) {
        console.error('Error al actualizar la estructura de la tabla:', error)
    }
}

// Ejecutar la función
updateTableStructure() 