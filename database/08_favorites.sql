-- Create favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
    favorite_id SERIAL PRIMARY KEY,
    account_id INTEGER NOT NULL REFERENCES public.account(account_id) ON DELETE CASCADE,
    inventory_id INTEGER NOT NULL REFERENCES public.inventory(inv_id) ON DELETE CASCADE,
    favorite_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(account_id, inventory_id)
);
-- Add indexes
CREATE INDEX idx_favorites_account ON public.favorites(account_id);
CREATE INDEX idx_favorites_inventory ON public.favorites(inventory_id);
-- Add sample data (opcional)
INSERT INTO public.favorites (account_id, inventory_id)
SELECT (
        SELECT account_id
        FROM public.account
        WHERE account_email = 'admin@cse340.net'
        LIMIT 1
    ), inv_id
FROM public.inventory
LIMIT 2;