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
  CONSTRAINT changesets_pkey PRIMARY KEY (gid)
)

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