insert into account (account_firstname, account_lastname, account_email, account_password)
values ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

select * from account where account_firstname = 'Tony';

update account set account_type = 'Admin' where account_id = 1;

delete from account where account_id = 1;

select * from inventory where inv_make = 'GM' and inv_model = 'Hummer';

-- 4
update inventory set inv_description = replace(inv_description, 'small interiors', 'a huge interior')
where inv_make = 'GM' and inv_model = 'Hummer';

select i.inv_make, i.inv_model from inventory i join classification c on i.classification_id = c.classification_id
where c.classification_name = 'Sport';

-- 6
update inventory
set inv_image = replace(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = replace(inv_thumbnail, '/images/', '/images/vehicles/');

