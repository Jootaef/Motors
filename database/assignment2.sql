-- assignment2.sql

-- 1. Insert Tony Stark
INSERT INTO account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

-- 2. Make Tony an Admin
UPDATE account
SET account_type = 'Admin'
WHERE account_firstname = 'Tony' AND account_lastname = 'Stark';

-- 3. Delete Tony Stark
DELETE FROM account
WHERE account_firstname = 'Tony' AND account_lastname = 'Stark';

-- 4. Update GM Hummer description
UPDATE inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

-- 5. Select Sport classification vehicles
SELECT inv.inv_make, inv.inv_model, cls.classification_name
FROM inventory inv
INNER JOIN classification cls ON inv.classification_id = cls.classification_id
WHERE cls.classification_name = 'Sport';

-- 6. Update image paths to include "/vehicles"
UPDATE inventory
SET 
    inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/')