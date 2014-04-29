SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

CREATE EXTENSION IF NOT EXISTS hstore;
CREATE EXTENSION IF NOT EXISTS intarray;

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA public;
SET search_path = public, pg_catalog;

DROP TYPE IF EXISTS format_enum CASCADE;
DROP TYPE IF EXISTS nws_enum CASCADE;
DROP TYPE IF EXISTS atlastory_object CASCADE;
DROP TYPE IF EXISTS directive CASCADE;

CREATE TYPE format_enum AS ENUM (
    'html',
    'markdown',
    'text'
);
CREATE TYPE nws_enum AS ENUM (
    'Node',
    'Way',
    'Shape'
);
CREATE TYPE atlastory_object AS ENUM (
    'period',
    'type',
    'node',
    'way',
    'shape'
);
CREATE TYPE directive AS ENUM (
    'add',
    'edit',
    'delete',
    'link',    -- link shape to new period
    'split'    -- clone shape into new period
);



-- TABLES

DROP TABLE IF EXISTS public.changesets CASCADE;
DROP TABLE IF EXISTS public.directives CASCADE;
DROP TABLE IF EXISTS public.types CASCADE;
DROP TABLE IF EXISTS public.periods CASCADE;
DROP TABLE IF EXISTS public.sources CASCADE;
DROP TABLE IF EXISTS public.nodes CASCADE;
DROP TABLE IF EXISTS public.ways CASCADE;
DROP TABLE IF EXISTS public.way_nodes CASCADE;
DROP TABLE IF EXISTS public.shapes CASCADE;
DROP TABLE IF EXISTS public.shape_relations CASCADE;

CREATE TABLE changesets (
    id serial8 NOT NULL,
    user_id integer NOT NULL,
    message text,
    created_at timestamp without time zone NOT NULL DEFAULT NOW(),
    CONSTRAINT changesets_pkey PRIMARY KEY (id)
);

CREATE TABLE directives (
    id serial8 NOT NULL,
    changeset_id bigint NOT NULL,
    action directive NOT NULL,
    object atlastory_object,
    object_id bigint,
    data text,
    geometry text,
    way_nodes text,
    shape_relations text,
    created_at timestamp without time zone NOT NULL DEFAULT NOW(),
    CONSTRAINT directives_pkey PRIMARY KEY (id)
);

CREATE TABLE types (
    id serial NOT NULL,
    type varchar(25) NOT NULL,
    name varchar(255) NOT NULL,
    color1 varchar(255) DEFAULT '',
    color2 varchar(255) DEFAULT '',
    created_at timestamp without time zone NOT NULL DEFAULT NOW(),
    updated_at timestamp without time zone NOT NULL DEFAULT NOW(),
    CONSTRAINT types_pkey PRIMARY KEY (id)
);

CREATE TABLE periods (
    id serial8 NOT NULL,
    name varchar(1024) DEFAULT NULL,
    start_year int NOT NULL,
    start_month int NOT NULL DEFAULT 1,
    start_day int NOT NULL DEFAULT 1,
    end_year int NOT NULL,
    end_month int NOT NULL DEFAULT 1,
    end_day int NOT NULL DEFAULT 1,
    created_at timestamp without time zone NOT NULL DEFAULT NOW(),
    updated_at timestamp without time zone NOT NULL DEFAULT NOW(),
    CONSTRAINT periods_pkey PRIMARY KEY (id)
);

CREATE TABLE sources (
    id serial NOT NULL,
    name varchar(1024) DEFAULT NULL,
    source varchar(1024) DEFAULT NULL,
    created_at timestamp without time zone NOT NULL DEFAULT NOW(),
    updated_at timestamp without time zone NOT NULL DEFAULT NOW(),
    CONSTRAINT sources_pkey PRIMARY KEY (id)
);

CREATE TABLE nodes (
    id serial8 NOT NULL,
    latitude numeric NOT NULL,
    longitude numeric NOT NULL,
    source_id int DEFAULT 1,
    tile bigint,
    created_at timestamp without time zone NOT NULL DEFAULT NOW(),
    CONSTRAINT nodes_pkey PRIMARY KEY (id),
    CONSTRAINT nodes_source_id_fkey FOREIGN KEY (source_id) REFERENCES sources(id)
);

CREATE TABLE ways (
    id serial8 NOT NULL,
    created_at timestamp without time zone NOT NULL DEFAULT NOW(),
    CONSTRAINT ways_pkey PRIMARY KEY (id)
);

CREATE TABLE way_nodes (
    way_id bigint NOT NULL,
    node_id bigint NOT NULL,
    sequence_id bigint NOT NULL,
    CONSTRAINT way_nodes_pkey PRIMARY KEY (way_id, sequence_id),
    CONSTRAINT way_nodes_nid_fkey FOREIGN KEY (node_id) REFERENCES nodes(id),
    CONSTRAINT way_nodes_wid_fkey FOREIGN KEY (way_id) REFERENCES ways(id)
);

CREATE TABLE shapes (
    id serial8 NOT NULL,
    type_id int NOT NULL,
    periods bigint[] NOT NULL,
    name character varying(250),
    description text,
    date_start character varying(20),
    date_end character varying(20),
    tags integer[],
    data hstore,
    CONSTRAINT shapes_pkey PRIMARY KEY (id),
    CONSTRAINT shapes_type_id_fkey FOREIGN KEY (type_id) REFERENCES types(id)
);

CREATE TABLE shape_relations (
    shape_id bigint DEFAULT 0 NOT NULL,
    relation_type nws_enum NOT NULL,
    relation_id bigint NOT NULL,
    relation_role character varying(255) NOT NULL,
    sequence_id integer DEFAULT 0 NOT NULL,
    CONSTRAINT shape_relations_pkey PRIMARY KEY (shape_id, relation_type, relation_id, relation_role, sequence_id),
    CONSTRAINT shape_relations_id_fkey FOREIGN KEY (shape_id) REFERENCES shapes(id)
);


-- FUNCTIONS

DROP FUNCTION IF EXISTS create_node(numeric, numeric, int, bigint);

CREATE FUNCTION create_node(lon numeric, lat numeric, source int, tile bigint)
  RETURNS bigint AS
$$  DECLARE new_id BIGINT;
    BEGIN
      SELECT id FROM nodes WHERE longitude = lon AND latitude = lat
        ORDER BY created_at DESC LIMIT 1 INTO new_id;
      IF new_id IS NULL THEN
        INSERT INTO nodes (longitude, latitude, source_id, tile)
          VALUES (lon, lat, source, tile) RETURNING id INTO new_id;
      END IF;
      RETURN new_id;
    END;
$$  LANGUAGE plpgsql;

-- SEED DATA

INSERT INTO changesets (user_id, message) VALUES
    (1, 'Initial commit');
INSERT INTO directives (changeset_id, action, object, object_id, data) VALUES
    (1, 'add', 'period', 1, '{"name":"1999-2000","start_year":1999,"end_year":2000}'),
    (1, 'add', 'type', 1, '{"name":"Land","type:":"land"}');
INSERT INTO periods (name, start_year, end_year) VALUES
    ('1999-2000', 1999, 2000);
INSERT INTO types (type, name) VALUES
    ('land', 'Land');

INSERT INTO sources (name, source) VALUES
    ('Atlastory Contributors', 'http://forum.atlastory.com/');

