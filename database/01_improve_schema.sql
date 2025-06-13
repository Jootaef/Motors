-- Add unique constraint to account email
ALTER TABLE public.account
ADD CONSTRAINT account_email_unique UNIQUE (account_email);
-- Add email validation constraint
ALTER TABLE public.account
ADD CONSTRAINT account_email_check CHECK (
        account_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    );
-- Add timestamp fields to account table
ALTER TABLE public.account
ADD COLUMN account_created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN account_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
-- Add unique constraint to classification name
ALTER TABLE public.classification
ADD CONSTRAINT classification_name_unique UNIQUE (classification_name);
-- Add timestamp fields to classification table
ALTER TABLE public.classification
ADD COLUMN classification_created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN classification_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
-- Improve inventory table structure
ALTER TABLE public.inventory -- Change year to integer
ALTER COLUMN inv_year TYPE integer USING inv_year::integer,
    -- Allow decimal prices
ALTER COLUMN inv_price TYPE numeric(10, 2),
    -- Add timestamp fields
ADD COLUMN inv_created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN inv_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Add soft delete
ADD COLUMN inv_deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN IF TG_TABLE_NAME = 'account' THEN NEW.account_updated_at = CURRENT_TIMESTAMP;
ELSIF TG_TABLE_NAME = 'classification' THEN NEW.classification_updated_at = CURRENT_TIMESTAMP;
ELSIF TG_TABLE_NAME = 'inventory' THEN NEW.inv_updated_at = CURRENT_TIMESTAMP;
END IF;
RETURN NEW;
END;
$$ language 'plpgsql';
-- Create triggers for updating timestamps
CREATE TRIGGER update_account_updated_at BEFORE
UPDATE ON public.account FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classification_updated_at BEFORE
UPDATE ON public.classification FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE
UPDATE ON public.inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Create index for faster email searches
CREATE INDEX idx_account_email ON public.account(account_email);
-- Create index for faster inventory searches
CREATE INDEX idx_inventory_make_model ON public.inventory(inv_make, inv_model);
CREATE INDEX idx_inventory_classification ON public.inventory(classification_id);
CREATE INDEX idx_inventory_featured ON public.inventory(is_featured)
WHERE is_featured = true;
-- Add comments to tables and columns for better documentation
COMMENT ON TABLE public.account IS 'Stores user account information';
COMMENT ON COLUMN public.account.account_email IS 'Unique email address for user login';
COMMENT ON COLUMN public.account.account_type IS 'User role: Client, Employee, or Admin';
COMMENT ON TABLE public.classification IS 'Vehicle classifications/categories';
COMMENT ON COLUMN public.classification.classification_name IS 'Unique name for vehicle classification';
COMMENT ON TABLE public.inventory IS 'Vehicle inventory information';
COMMENT ON COLUMN public.inventory.inv_year IS 'Year of vehicle manufacture';
COMMENT ON COLUMN public.inventory.inv_price IS 'Vehicle price with 2 decimal places';
COMMENT ON COLUMN public.inventory.inv_deleted_at IS 'Soft delete timestamp, NULL if not deleted';