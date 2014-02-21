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


SET default_tablespace = '';
SET default_with_oids = false;


-- TABLES

DROP TABLE public.changesets CASCADE;
DROP TABLE public.periods CASCADE;
DROP TABLE public.nodes CASCADE;
DROP TABLE public.ways CASCADE;
DROP TABLE public.way_nodes CASCADE;
DROP TABLE public.shapes CASCADE;
DROP TABLE public.shape_relations CASCADE;

CREATE TABLE changesets (
    id bigint NOT NULL,
    changeset character varying,
    user_id integer,
    action character varying(50),
    object character varying(50),
    --map integer,
    layer integer,
    period integer,
    --shape integer,
    --data text,
    --data_old text,
    --type character varying(255),
    --geom_diff text,
    created_at timestamp without time zone NOT NULL,
    CONSTRAINT changesets_pkey PRIMARY KEY (id)
);
CREATE SEQUENCE changesets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE changesets_id_seq OWNED BY changesets.id;

CREATE TABLE layers (
    id serial NOT NULL,
    name varchar(255) NOT NULL,
    short_name
    level integer DEFAULT NULL,
    color1 varchar(255) NOT NULL DEFAULT '',
    color2 varchar(255) NOT NULL DEFAULT '',
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    CONSTRAINT layers_pkey PRIMARY KEY (id)
);

CREATE TABLE periods (
    id serial8 NOT NULL,
    layer_id integer NOT NULL,
    name varchar(1024) DEFAULT NULL,
    start_day varchar(100) NOT NULL DEFAULT '',
    end_day varchar(100) NOT NULL DEFAULT '',
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    CONSTRAINT periods_pkey PRIMARY KEY (id)
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
    datestart character varying(20),
    dateend character varying(20),
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




