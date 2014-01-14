
CREATE EXTENSION postgis;
CREATE EXTENSION hstore;
CREATE EXTENSION intarray;

CREATE TABLE spatial_ref_sys (
  srid integer NOT NULL,
  auth_name character varying(256),
  auth_srid integer,
  srtext character varying(2048),
  proj4text character varying(2048),
  CONSTRAINT spatial_ref_sys_pkey PRIMARY KEY (srid)
);

CREATE TABLE polygon (
  gid serial NOT NULL,
  lat double precision,
  lon double precision,
  layers int8[],
  periods int8[],
  sources int8[],
  ref int8,
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

# Testing table (schema for all layers)

CREATE TABLE l_0 (
  gid serial NOT NULL,
  period bigint,
  shape bigint,
  name character varying(250),
  description text,
  datestart character varying(20),
  dateend character varying(20),
  tags integer[],
  data hstore,
  CONSTRAINT l_0_pkey PRIMARY KEY (gid)
);

# Geometry columns

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

# Seed TEST layer table

INSERT INTO point (
  geom,
  layers,
  periods,
  sources
) VALUES (
  "0101000020E6100000C3F5285C8FC22140C3F5285C8FC22140",
  "{0}",
  "{1}",
  "{1}"
);

INSERT INTO l_0 (
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
  '{"red","blue"}',
  '986-08-08',
  '986-08-08',
  '"a"=>"1", "b"=>"2"'
);

