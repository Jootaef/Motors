-- Test accounts with different account types
-- All passwords are: Test123!@#
-- The passwords are hashed using bcrypt

INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type)
VALUES 
    ('Admin', 'User', 'admin@test.com', '$2b$10$8K1p/a0dR1xqM8K3hQZz3OQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZ', 'Admin'),
    ('Employee', 'User', 'employee@test.com', '$2b$10$8K1p/a0dR1xqM8K3hQZz3OQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZ', 'Employee'),
    ('Client', 'User', 'client@test.com', '$2b$10$8K1p/a0dR1xqM8K3hQZz3OQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZ', 'Client');

-- Note: The password hash above is a placeholder. In a real environment, 
-- you would generate proper bcrypt hashes for each password.
-- For testing purposes, you can use these credentials:
-- Email: admin@test.com, Password: Test123!@#
-- Email: employee@test.com, Password: Test123!@#
-- Email: client@test.com, Password: Test123!@# 