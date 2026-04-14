-- Aggiunge colonna images (array di URL) ai prodotti.
-- image_url rimane come cover (primo elemento dell'array, usato nelle card).
alter table products
  add column if not exists images text[] not null default '{}';

-- Migra i prodotti esistenti: sposta image_url in images[1] se presente
update products
   set images = array[image_url]
 where image_url is not null
   and array_length(images, 1) is null;
