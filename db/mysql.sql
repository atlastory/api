

CREATE TABLE `maps` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `order` int(11) DEFAULT NULL,
  `max_zoom` int(11) DEFAULT NULL,
  `datestart` date DEFAULT NULL,
  `dateend` date DEFAULT NULL,
  `initial_lat` decimal(9,6) DEFAULT NULL,
  `initial_lon` decimal(9,6) DEFAULT NULL,
  `initial_zoom` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;

CREATE TABLE `layers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `map_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `color` varchar(255) NOT NULL DEFAULT '',
  `border_color` varchar(255) NOT NULL DEFAULT '',
  `level` int(11) DEFAULT NULL,
  `short_name` varchar(255) DEFAULT NULL,
  `shape` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;

CREATE TABLE `periods` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `layer_id` int(11) NOT NULL,
  `name` varchar(1024) DEFAULT NULL,
  `start` varchar(100) NOT NULL DEFAULT '',
  `end` varchar(100) NOT NULL DEFAULT '',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;

CREATE TABLE `sources` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `source` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

CREATE TABLE `stylesheets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `map_id` int(11) NOT NULL,
  `level_name` varchar(255) DEFAULT NULL,
  `data` text,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;

CREATE TABLE `render_queues` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `map_id` int(11) DEFAULT NULL,
  `stylesheet_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `done` datetime DEFAULT NULL,
  `period_id` int(11) DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  `start` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=156 DEFAULT CHARSET=latin1;


-- Seeding

INSERT INTO maps (
  category_id,
  name,
  description,
  max_zoom,
  initial_zoom,
  created_at,
  updated_at
) VALUES (
  1,
  'Basemap',
  '',
  7,
  4,
  NOW(),
  NOW()
);

INSERT INTO layers (
  map_id,
  name,
  level,
  short_name,
  shape,
  created_at,
  updated_at
) VALUES (
  1,
  'Test',
  1,
  'test',
  'point',
  NOW(),
  NOW()
);

INSERT INTO periods (
  layer_id,
  name,
  start,
  end,
  created_at,
  updated_at
) VALUES (
  1,
  '1990-2010',
  '1990-01-01',
  '2010-01-01',
  NOW(),
  NOW()
);
