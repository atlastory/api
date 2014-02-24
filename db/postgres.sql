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
    'layer',
    'period',
    'node',
    'way',
    'shape'
);


SET default_tablespace = '';
SET default_with_oids = false;


-- TABLES

DROP TABLE IF EXISTS public.changesets CASCADE;
DROP TABLE IF EXISTS public.layers CASCADE;
DROP TABLE IF EXISTS public.periods CASCADE;
DROP TABLE IF EXISTS public.nodes CASCADE;
DROP TABLE IF EXISTS public.ways CASCADE;
DROP TABLE IF EXISTS public.way_nodes CASCADE;
DROP TABLE IF EXISTS public.shapes CASCADE;
DROP TABLE IF EXISTS public.shape_relations CASCADE;

CREATE TABLE changesets (
    id serial8 NOT NULL,
    changeset character varying NOT NULL,
    user_id integer NOT NULL,
    action character varying(50),
    object atlastory_object,
    data text,
    geometry text,
    created_at timestamp without time zone NOT NULL DEFAULT NOW(),
    CONSTRAINT changesets_pkey PRIMARY KEY (id)
);

CREATE TABLE layers (
    id serial NOT NULL,
    name varchar(255) NOT NULL,
    short_name varchar(20) NOT NULL,
    level integer DEFAULT NULL,
    color1 varchar(255) NOT NULL DEFAULT '',
    color2 varchar(255) NOT NULL DEFAULT '',
    changeset_id bigint,
    created_at timestamp without time zone NOT NULL DEFAULT NOW(),
    updated_at timestamp without time zone NOT NULL DEFAULT NOW(),
    CONSTRAINT layers_pkey PRIMARY KEY (id),
    CONSTRAINT layers_changeset_id_fkey FOREIGN KEY (changeset_id) REFERENCES changesets(id)
);

CREATE TABLE periods (
    id serial8 NOT NULL,
    layer_id integer NOT NULL,
    name varchar(1024) DEFAULT NULL,
    start_day varchar(100) NOT NULL DEFAULT '',
    end_day varchar(100) NOT NULL DEFAULT '',
    changeset_id bigint,
    created_at timestamp without time zone NOT NULL DEFAULT NOW(),
    updated_at timestamp without time zone NOT NULL DEFAULT NOW(),
    CONSTRAINT periods_pkey PRIMARY KEY (id),
    CONSTRAINT periods_layer_id_fkey FOREIGN KEY (layer_id) REFERENCES layers(id),
    CONSTRAINT periods_changeset_id_fkey FOREIGN KEY (changeset_id) REFERENCES changesets(id)
);

CREATE TABLE nodes (
    id serial8 NOT NULL,
    latitude numeric NOT NULL,
    longitude numeric NOT NULL,
    changeset_id bigint,
    tile bigint,
    created_at timestamp without time zone NOT NULL DEFAULT NOW(),
    CONSTRAINT nodes_pkey PRIMARY KEY (id),
    CONSTRAINT nodes_changeset_id_fkey FOREIGN KEY (changeset_id) REFERENCES changesets(id)
);

CREATE TABLE ways (
    id serial8 NOT NULL,
    changeset_id bigint,
    CONSTRAINT ways_pkey PRIMARY KEY (id),
    CONSTRAINT ways_changeset_id_fkey FOREIGN KEY (changeset_id) REFERENCES changesets(id)
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
    period_id bigint NOT NULL,
    changeset_id bigint,
    name character varying(250),
    description text,
    day_start character varying(20),
    day_end character varying(20),
    sources integer[],
    tags integer[],
    data hstore,
    CONSTRAINT shapes_pkey PRIMARY KEY (id),
    CONSTRAINT shapes_period_id_fkey FOREIGN KEY (period_id) REFERENCES periods(id),
    CONSTRAINT shapes_changeset_id_fkey FOREIGN KEY (changeset_id) REFERENCES changesets(id)
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

-- SEED DATA

INSERT INTO changesets (changeset, user_id, action, object, data) VALUES
    ('first', 1, 'add', 'layer', '{"name":"Countries","short_name":"countries","level":0}'),
    ('first', 1, 'add', 'period', '{"layer_id":1,"name":"1999-2000","start_day":"1999-01-01","end_day":"2000-01-01"}');
INSERT INTO layers (name, short_name, level, changeset_id) VALUES
    ('Countries', 'countries', 0, 1);
INSERT INTO periods (layer_id, name, start_day, end_day, changeset_id) VALUES
    (1, '1999-2000', '1999-01-01', '2000-01-01', 2);


