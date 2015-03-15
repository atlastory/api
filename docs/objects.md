# Objects and structure

![](//images/structure.jpg?raw=true)

### Nodes

```sh
$ curl api.atlastory.com/nodes/1
```

A Node represents a specific point on the earth's surface defined by its latitude and longitude. Nodes are the fundamental building blocks of the map. Each Node also belongs to a Source.

### Ways

```sh
$ curl api.atlastory.com/ways/1
$ curl api.atlastory.com/ways/1.geojson
$ curl api.atlastory.com/ways/1.topojson
```

A Way is an ordered list of Nodes that can represent a line or polygon, connected through **Way Nodes**. A Way is a polygon if its first and last Nodes are the same. 

### Shapes

```sh
$ curl api.atlastory.com/shapes/1
$ curl api.atlastory.com/shapes/1.geojson
$ curl api.atlastory.com/shapes/1.topojson
```

A Shape is an actual feature on the map. It can contain any ordered combination of Nodes and Ways connected through **Shape Relations**. In the database, each Shape has a beginning and end date, along with a `data` column that contains key/value pairs representing any other data associated with the shape: name, description, etc.

Each connected Node or Way has a **type** specified in the Shape Relation: `outer` (polygon), `inner` (polygon), `point`, `center`, or `line`.

Unlike OpenStreetMap where Nodes & Ways can be accessed individually, all data and tag access must be through a Shape. 

### Periods

```sh
$ curl api.atlastory.com/periods/1
```

Defined, non-overlapping time periods that contain every Shape for that time. Each Period can be thought of as its own map -- so if this were OpenStreetMap, there would be just one Period: the "current" one.

The original reason for having separate "periods" in addition to each Shape having a start/end was to avoid map conflicts. When editing the map, the contributor knows they are editing a *defined period*, not a map where each Shape has its own start/end point.

**A quick example of map conflict:** `Shape-A` spanning 1800-1900 borders or compliments `Shape-B` spanning 1860-1900. If the first shape is edited while viewing in 1800, it may conflict with the second shape. Instead of making contributors find and correct all map conflicts, defined **Periods** are used: `Shape-A` belongs to 2 Periods, 1800-1860 and 1860-1900. The 1860-1900 `Shape-A` can be edited into a new Shape without effecting the 1800-1860 version.

The Periods concept may become obsolete if we can find a way of fixing the conflict/overlapping problem without it. At the moment, Periods will exist in tandem with times for individual Shapes.

### Levels

```sh
$ curl api.atlastory.com/levels/land
```

Like traditional GIS "layers", except that they contain multiple **Types** of shapes that can be style separately or together. A level contains objects of the same kind (point, line, or polygon) and of similar styling.

1. land
2. admin1
3. admin2
4. admin3
5. settlements
6. rivers
7. lakes

### Types
Types are used for styling. Every Shape belongs to a Type. Examples:

* `admin1`: sovereignty, country, dependency, colony
* `admin2`: state, province, republic
* `settlements`: city, capital-[1-3], town, village

So a Shape might contain a single Node, and belong to the `town` type, which in turn belongs to the `settlements` Level.
