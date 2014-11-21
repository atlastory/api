-- STRUCTURE
-- Contains the complete, current version of the Atlastory database
-- (Must stay up-to-date at all times)
--
-- Partly based on OpenStreetMap data structure:
-- https://github.com/openstreetmap/openstreetmap-website/blob/master/db/structure.sql
--
----------------------------------------------------

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
    'level',
    'type',
    'source',
    'node',
    'way',
    'shape',
    'period'
);
CREATE TYPE directive AS ENUM (
    'add',
    'edit',
    'delete',
    'link',    -- link shape to new period
    'split'    -- clone shape into new period
);



-- TABLES

DROP TABLE IF EXISTS public.config CASCADE;
DROP TABLE IF EXISTS public.changesets CASCADE;
DROP TABLE IF EXISTS public.directives CASCADE;
DROP TABLE IF EXISTS public.levels CASCADE;
DROP TABLE IF EXISTS public.types CASCADE;
DROP TABLE IF EXISTS public.periods CASCADE;
DROP TABLE IF EXISTS public.sources CASCADE;
DROP TABLE IF EXISTS public.nodes CASCADE;
DROP TABLE IF EXISTS public.ways CASCADE;
DROP TABLE IF EXISTS public.way_nodes CASCADE;
DROP TABLE IF EXISTS public.shapes CASCADE;
DROP TABLE IF EXISTS public.shape_relations CASCADE;

CREATE TABLE config (
    key varchar(255),
    value text,
    CONSTRAINT config_pkey PRIMARY KEY (key)
);

CREATE TABLE changesets (
    id serial8 NOT NULL,
    user_id integer NOT NULL,
    message text,
    status varchar(10) DEFAULT 'start',
    min_lat integer,
    max_lat integer,
    min_lon integer,
    max_lon integer,
    created_at timestamp without time zone NOT NULL DEFAULT NOW(),
    finished_at timestamp without time zone,
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

CREATE TABLE levels (
    id serial NOT NULL,
    name varchar(25) NOT NULL,
    level int NOT NULL DEFAULT 0,
    created_at timestamp without time zone NOT NULL DEFAULT NOW(),
    updated_at timestamp without time zone NOT NULL DEFAULT NOW(),
    CONSTRAINT levels_pkey PRIMARY KEY (id)
);

CREATE TABLE types (
    id serial NOT NULL,
    level_id int NOT NULL,
    name varchar(50) NOT NULL,
    color_1 varchar(255) DEFAULT '',
    color_2 varchar(255) DEFAULT '',
    created_at timestamp without time zone NOT NULL DEFAULT NOW(),
    updated_at timestamp without time zone NOT NULL DEFAULT NOW(),
    CONSTRAINT types_pkey PRIMARY KEY (id),
    CONSTRAINT types_levels_id_fkey FOREIGN KEY (level_id) REFERENCES levels(id)
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
CREATE INDEX period_start_year_idx ON periods (start_year);
CREATE INDEX period_end_year_idx ON periods (end_year);

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
CREATE INDEX latitude_idx ON nodes (latitude);
CREATE INDEX longitude_idx ON nodes (longitude);
CREATE INDEX nodes_created_at_idx ON nodes (created_at);

CREATE TABLE ways (
    id serial8 NOT NULL,
    created_at timestamp without time zone NOT NULL DEFAULT NOW(),
    CONSTRAINT ways_pkey PRIMARY KEY (id)
);

CREATE TABLE way_nodes (
    way_id bigint NOT NULL,
    node_id bigint NOT NULL,
    sequence_id bigint NOT NULL,
    CONSTRAINT way_nodes_pkey PRIMARY KEY (way_id, sequence_id) DEFERRABLE INITIALLY IMMEDIATE,
    CONSTRAINT way_nodes_nid_fkey FOREIGN KEY (node_id) REFERENCES nodes(id),
    CONSTRAINT way_nodes_wid_fkey FOREIGN KEY (way_id) REFERENCES ways(id)
);
CREATE INDEX way_nodes_way_idx ON way_nodes (way_id);
CREATE INDEX way_nodes_node_idx ON way_nodes (node_id);
CREATE INDEX way_nodes_sequence_idx ON way_nodes (sequence_id);

CREATE TABLE shapes (
    id serial8 NOT NULL,
    type_id int NOT NULL,
    periods bigint[] NOT NULL,
    start_year int,
    start_month int DEFAULT 1,
    start_day int DEFAULT 1,
    end_year int,
    end_month int DEFAULT 1,
    end_day int DEFAULT 1,
    tags integer[],
    data hstore,
    CONSTRAINT shapes_pkey PRIMARY KEY (id),
    CONSTRAINT shapes_type_id_fkey FOREIGN KEY (type_id) REFERENCES types(id)
);
CREATE INDEX shape_start_year_idx ON shapes (start_year);
CREATE INDEX shape_end_year_idx ON shapes (end_year);
-- TODO: Index data hstore
-- See: http://www.pgcon.org/2014/schedule/attachments/318_pgcon-2014-vodka.pdf

CREATE TABLE shape_relations (
    shape_id bigint DEFAULT 0 NOT NULL,
    relation_type nws_enum NOT NULL,
    relation_id bigint NOT NULL,
    relation_role character varying(255) NOT NULL,
    sequence_id integer DEFAULT 0 NOT NULL,
    CONSTRAINT shape_relations_pkey PRIMARY KEY (shape_id, relation_type, relation_id, relation_role, sequence_id) DEFERRABLE INITIALLY IMMEDIATE,
    CONSTRAINT shape_relations_id_fkey FOREIGN KEY (shape_id) REFERENCES shapes(id)
);
CREATE INDEX relations_shape_idx ON shape_relations (shape_id);
CREATE INDEX relations_id_idx ON shape_relations (relation_id);
CREATE INDEX relations_sequence_idx ON shape_relations (sequence_id);


-- FUNCTIONS

-- CREATE NODE
DROP FUNCTION IF EXISTS create_node(numeric, numeric, int, bigint);
CREATE FUNCTION create_node(lon numeric, lat numeric, source int, tile bigint)
  RETURNS bigint AS
$$  DECLARE new_id BIGINT;
    BEGIN
      INSERT INTO nodes (longitude, latitude, source_id, tile)
        VALUES (lon, lat, source, tile) RETURNING id INTO new_id;
      RETURN new_id;
    END;
$$  LANGUAGE plpgsql;

-- CREATE NODE IF NEW
-- Checks if coordinate exists first, if not creates it
DROP FUNCTION IF EXISTS create_node_if_new(numeric, numeric, int, bigint);
CREATE FUNCTION create_node_if_new(lon numeric, lat numeric, source int, tile bigint)
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

-- CREATE WAY NODES
-- Creates nodes + way_node relations
-- check_nodes: 0 = don't check; 1 = check duplicates; 2 = check everything
-- Accepts nodes in the format of ARRAY[[45,12],[8.64,27.111]]
DROP FUNCTION IF EXISTS create_way_nodes(int, numeric[][], int[], int, bigint);
CREATE FUNCTION create_way_nodes(check_nodes int, nodes numeric[][], duplicates int[], source int, way bigint)
  RETURNS bigint AS
$$  DECLARE
      len int;
    BEGIN
      len = array_length(nodes,1);
      FOR i IN 1..len LOOP
        IF check_nodes = 0 THEN
          INSERT INTO way_nodes (node_id,way_id,sequence_id) VALUES
            (create_node(nodes[i][1], nodes[i][2], source, NULL), way, i-1);
        ELSIF check_nodes = 1 AND i = ANY (duplicates) THEN
          -- TODO: make this faster (all values in 1 INSERT)
          INSERT INTO way_nodes (node_id,way_id,sequence_id) VALUES
            (create_node_if_new(nodes[i][1], nodes[i][2], source, NULL), way, i-1);
        ELSE
          INSERT INTO way_nodes (node_id,way_id,sequence_id) VALUES
            (create_node_if_new(nodes[i][1], nodes[i][2], source, NULL), way, i-1);
        END IF;
      END LOOP;
      RETURN way;
    END;
$$  LANGUAGE plpgsql;

-- CREATE WAY
DROP FUNCTION IF EXISTS cw();
CREATE FUNCTION cw()
  RETURNS bigint AS
$$  DECLARE new_id BIGINT;
    BEGIN
        INSERT INTO ways (id) VALUES (DEFAULT) RETURNING id INTO new_id;
      RETURN new_id;
    END;
$$  LANGUAGE plpgsql;
