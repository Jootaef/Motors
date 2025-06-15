const pool = require('./')

async function createFavoritesTable() {
    try {
        const sql = `
            CREATE TABLE IF NOT EXISTS public.favorites (
                favorite_id SERIAL PRIMARY KEY,
                account_id INTEGER NOT NULL REFERENCES public.account(account_id) ON DELETE CASCADE,
                inventory_id INTEGER NOT NULL REFERENCES public.inventory(inv_id) ON DELETE CASCADE,
                favorite_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(account_id, inventory_id)
            );

            CREATE INDEX IF NOT EXISTS idx_favorites_account ON public.favorites(account_id);
            CREATE INDEX IF NOT EXISTS idx_favorites_inventory ON public.favorites(inventory_id);
        `
        await pool.query(sql)
        console.log('Favorites table created successfully')
        process.exit()
    } catch (error) {
        console.error('Error creating favorites table:', error)
        process.exit(1)
    }
}

createFavoritesTable() 