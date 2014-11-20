-- USE THIS TEMPLATE FOR ANY FUTURE MIGRATIONS
-- (1) Add new tables, functions, indexes, views

CREATE TABLE test (
    id integer,
    one integer
);

-- (2) Modify current tables, views

ALTER TABLE test ADD COLUMN two integer;

-- (3) Remove tables, functions, indexes, views

DROP TABLE test CASCADE;
