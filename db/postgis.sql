
-- Enable PostGIS (includes raster)
CREATE EXTENSION postgis;
-- Enable Topology
CREATE EXTENSION postgis_topology;
-- fuzzy matching needed for Tiger
CREATE EXTENSION fuzzystrmatch;
-- Enable US Tiger Geocoder
CREATE EXTENSION postgis_tiger_geocoder;

CREATE EXTENSION hstore;
CREATE EXTENSION intarray;



CREATE TABLE polygon (
  gid serial NOT NULL,
  lat double precision,
  lon double precision,
  layers int8[],
  periods int8[],
  sources int8[],
  ref int8,
  changeset character varying,
  geom geometry,
  CONSTRAINT polygon_pkey PRIMARY KEY (gid),
  CONSTRAINT enforce_dims_geom CHECK (st_ndims(geom) = 2)
);

CREATE TABLE line (
  gid serial NOT NULL,
  lat double precision,
  lon double precision,
  layers int8[],
  periods int8[],
  sources int8[],
  ref int8,
  changeset character varying,
  geom geometry,
  CONSTRAINT line_pkey PRIMARY KEY (gid),
  CONSTRAINT enforce_dims_geom CHECK (st_ndims(geom) = 2)
);

CREATE TABLE point (
  gid serial NOT NULL,
  lat double precision,
  lon double precision,
  layers int8[],
  periods int8[],
  sources int8[],
  ref int8,
  changeset character varying,
  geom geometry,
  CONSTRAINT point_pkey PRIMARY KEY (gid),
  CONSTRAINT enforce_dims_geom CHECK (st_ndims(geom) = 2)
);

CREATE TABLE changesets (
  gid serial NOT NULL,
  changeset character varying,
  user_id integer,
  action character varying(50),
  object character varying(50),
  map integer,
  layer integer,
  period integer,
  shape integer,
  data text,
  data_old text,
  type character varying(255),
  geom_diff text,
  created_at timestamp with time zone,
  CONSTRAINT changesets_pkey PRIMARY KEY (gid)
);


-- Testing table (schema for all layers)

CREATE TABLE l_1 (
  gid serial NOT NULL,
  period bigint,
  shape bigint,
  name character varying(250),
  description text,
  datestart character varying(20),
  dateend character varying(20),
  tags integer[],
  data hstore,
  changeset character varying,
  CONSTRAINT l_0_pkey PRIMARY KEY (gid)
);

CREATE VIEW lv_1 AS
  SELECT l_1.*, point.sources, point.geom
  FROM l_1 JOIN point
  ON point.gid = l_1.shape;


-- Geometry columns

INSERT INTO geometry_columns (
  f_table_catalog,
  f_table_schema,
  f_table_name,
  f_geometry_column,
  coord_dimension,
  srid,
  type
  ) VALUES (
	  '''',
	  'public',
	  'polygon',
	  'geom',
	  2,
	  4326,
	  'MULTIPOLYGON'
);

INSERT INTO geometry_columns (
  f_table_catalog,
  f_table_schema,
  f_table_name,
  f_geometry_column,
  coord_dimension,
  srid,
  type
  ) VALUES (
	  '''',
	  'public',
	  'line',
	  'geom',
	  2,
	  4326,
	  'MULTILINESTRING'
);

INSERT INTO geometry_columns (
  f_table_catalog,
  f_table_schema,
  f_table_name,
  f_geometry_column,
  coord_dimension,
  srid,
  type
  ) VALUES (
	  '''',
	  'public',
	  'point',
	  'geom',
	  2,
	  4326,
	  'POINT'
);


-- Seed TEST layer table

INSERT INTO point (
  geom,
  layers,
  periods,
  sources
) VALUES (
  ST_GeomFromText('POINT(8.88 8.88)', 4326),
  '{1}',
  '{1}',
  '{1}'
);

INSERT INTO l_1 (
  period,
  shape,
  name,
  description,
  tags,
  datestart,
  dateend,
  data
) VALUES (
  1,
  1,
  'mocha',
  'this is a test',
  '{1,2}',
  '986-08-08',
  '986-08-08',
  '"a"=>"1", "b"=>"2"'
);

