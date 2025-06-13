const pool = require('../database/')

async function optimizeSessionsTable() {
    try {
        // Crear índice en sid si no existe
        console.log('Verificando índice en sid...')
        const checkSidIndex = await pool.query(`
            SELECT EXISTS (
                SELECT 1
                FROM pg_indexes
                WHERE tablename = 'session'
                AND indexname = 'session_sid_idx'
            )
        `)

        if (!checkSidIndex.rows[0].exists) {
            console.log('Creando índice en sid...')
            await pool.query(`
                CREATE INDEX session_sid_idx ON session (sid)
            `)
            console.log('Índice en sid creado exitosamente')
        } else {
            console.log('El índice en sid ya existe')
        }

        // Crear índice en expire si no existe
        console.log('Verificando índice en expire...')
        const checkExpireIndex = await pool.query(`
            SELECT EXISTS (
                SELECT 1
                FROM pg_indexes
                WHERE tablename = 'session'
                AND indexname = 'session_expire_idx'
            )
        `)

        if (!checkExpireIndex.rows[0].exists) {
            console.log('Creando índice en expire...')
            await pool.query(`
                CREATE INDEX session_expire_idx ON session (expire)
            `)
            console.log('Índice en expire creado exitosamente')
        } else {
            console.log('El índice en expire ya existe')
        }

        // Crear índice compuesto para consultas comunes
        console.log('Verificando índice compuesto...')
        const checkCompositeIndex = await pool.query(`
            SELECT EXISTS (
                SELECT 1
                FROM pg_indexes
                WHERE tablename = 'session'
                AND indexname = 'session_sid_expire_idx'
            )
        `)

        if (!checkCompositeIndex.rows[0].exists) {
            console.log('Creando índice compuesto...')
            await pool.query(`
                CREATE INDEX session_sid_expire_idx ON session (sid, expire)
            `)
            console.log('Índice compuesto creado exitosamente')
        } else {
            console.log('El índice compuesto ya existe')
        }

    } catch (error) {
        console.error('Error al optimizar la tabla de sesiones:', error)
    }
}

// Ejecutar la función
optimizeSessionsTable() 