## Data structure <a name="structure"/>

![](./assets/images/structure.svg?raw=true)

### Objects

#### Nodes
A Node represents a specific point on the earth's surface defined by its latitude and longitude. Nodes are the fundamental building blocks of the map. Each Node also belongs to a Source.

#### Ways
A Way is an ordered list of Nodes that can represent a line or polygon, connected through **Way Nodes**. A Way is a polygon if its first and last Nodes are the same. 

#### Shapes
A Shape is an actual feature on the map. It can contain any ordered combination of Nodes and Ways connected through **Shape Relations**. In the database, each Shape has a beginning and end date, along with a `data` column that contains key/value pairs representing any other data associated with the shape: name, description, etc.

Each connected Node or Way has a **type** specified in the Shape Relation: `outer` (polygon), `inner` (polygon), `point`, `center`, or `line`.

Unlike OpenStreetMap where Nodes & Ways can be accessed individually, all data and tag access must be through a Shape. 

#### Periods
Defined, non-overlapping time periods that contain every Shape for that time. Each Period can be thought of as its own map -- so if this were OpenStreetMap, there would be just one Period: the "current" one.

The original reason for having separate "periods" in addition to each Shape having a start/end was to avoid map conflicts. When editing the map, the contributor knows they are editing a *defined period*, not a map where each Shape has its own start/end point.

**A quick example of map conflict:** `Shape-A` spanning 1800-1900 borders or compliments `Shape-B` spanning 1860-1900. If the first shape is edited while viewing in 1800, it may conflict with the second shape. Instead of making contributors find and correct all map conflicts, defined **Periods** are used: `Shape-A` belongs to 2 Periods, 1800-1860 and 1860-1900. The 1860-1900 `Shape-A` can be edited into a new Shape without effecting the 1800-1860 version.

The Periods concept may become obsolete if we can find a way of fixing the conflict/overlapping problem without it. At the moment, Periods will exist in tandem with times for individual Shapes.

#### Levels
Like traditional GIS "layers", except that they contain multiple **Types** of shapes that can be style separately or together. A level contains objects of the same kind (point, line, or polygon) and of similar styling.

1. land
2. admin1
3. admin2
4. admin3
5. settlements
6. rivers
7. lakes

#### Types
Types are used for styling. Every Shape belongs to a Type. Examples:

* `admin1`: sovereignty, country, dependency, colony
* `admin2`: state, province, republic
* `settlements`: city, capital-[1-3], town, village

So a Shape might contain a single Node, and belong to the `town` type, which in turn belongs to the `settlements` Level.

### Time

*Nodes* and *Ways* can be shared across Shapes and across time periods. Each *Shape* has a start and end datestamp.

The **datestamp** is a day in history with the format of **±YYYY-MM-DD** (in the [ISO standard](http://en.wikipedia.org/wiki/ISO_8601#Years) with expanded years and optional ±). In the current version of the API, time is accessed only by year, so although time can be stored by the day, when viewed/rendered it will be "rounded" to the year: YYYY-01-01. Shapes are also grouped by time using *Periods*, discussed above.

### Changesets

Each Changeset has a list of **directives**. A directive tells the Atlastory API what changes were made on an object. A directive serves three purposes: (1) to instruct the Atlastory API to change the database; (2) as a record of what was changed; and (3) as a template to reverse changes.

With the exception of importing a GeoJSON, each directive should represent 1 model query (i.e. add a node, edit a shape, etc.). Again, other than a GeoJSON import, there are no "bulk" directives that change many objects.

Each directive has an *action* (`add`,`edit`,`delete`) that is/was performed on the object.

* **action** -- `add`, `edit`, or `delete`
* **object** -- The object type (`node`, `way`, `shape`, `level`, `type`, `source`, `period`)
* **object_id** -- The ID of the changed object
* **data** -- A stringified JSON object for data of a shape, type, source, period.
* **geometry** -- A stringified coordinate array for a node or shape (if GeoJSON import)
* **way_nodes** -- Behaves differently depending on the object.
    * `object='way'`: a list of node IDs to add `345,678`
    * `object='way', action='delete'`: a list of sequence ID to delete `0,1,2`
    * `object='node'`: a list of wayId-sequenceId to add/delete `0-1234,1-2345`
* **shape_relations** -- Behaves differently depending on the object.
    * `object='shape'`: a list of sequence-Type-role-id to add/delete `0-Way-outer-1234,1-Node-center-5678`
    * `object='node','way'`: a list of shapeId-sequenceId to add/delete `0-1234,1-2345`

**Directive examples:**

| Action                              | Directive(s)                                                                                                                                            |
|-------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|
| Add completely new shape            | `add node n-1 geometry[0,0]`<br/>`add node n-2 geometry[0,0]`<br/>`add way w-3 way_nodes(n-1,n-2)`<br/>`add shape s-1 data{} shape_relations(Way-outer-w-3)` |
| Edit shape data                     | `edit shape %SHAPE data{}`                                                                                                                                |
| Delete way + non-shared nodes       | `delete way %WAY data{} way_nodes(%NODE,%NODE)`                                                                                                           |
| Add node into way (mid-sequence)    | `add node n-1 geometry[0,0] way_nodes(%SEQ-%WAY)`                                                                                                         |
| Edit node location                  | `edit node %NODE geometry[0,0]`                                                                                                                           |
| Delete node in shape                | `delete node %NODE geometry[0,0] way_nodes(%SEQ-%WAY)`<br/>`    || shape_relations(%SEQ-%SHAPE)`                                                                    |
| Add new way to existing shape       | `add node n-1 geometry[0,0]`<br/>`add node n-2 geometry[0,0]`<br/>`add way w-3 way_nodes(n-1,n-2)`<br/>`edit shape %SHAPE shape_relations(2-Way-outer-w-3)`  |
| Remove way from 1 shape only        | `delete shape %SHAPE shape_relation(5-Way-outer-%WAY)`                                                                                                    |
| Delete shape (relations must be removed first)        | `delete shape %SHAPE`                                                                                                    |
| Link existing way to existing shape | `edit shape %SHAPE shape_relation(2-Way-outer-%WAY)`                                                                                                      |
| Link existing way to new shape      | `add shape s-3 data{} shape_relations(0-Way-outer-%WAY)`  

### Glossary
See more in the [Glossary Wiki](https://github.com/atlastory/api/wiki/Glossary).

---------------------------------
## Utilities

#### Q+
Q+ is a utility add-on for the promise library Q. It can be used with promises to manipulate results, i.e. with #map, #each, etc. [See more here](https://github.com/maxprogram/q-plus).

#### #replace(string, values)
String replacing function. `values` can be an array or object, with an array replacing `%1, %2, %3` with element index numbers `0, 1, 2`. An object replaces `:a, :b, :c` with keys `{ a: '', b: 2, c: true }`.

#### #isBigint(string|number)
Checks whether the string is a number or not, no matter the length. Useful for checking Postgres IDs stored as 8-byte integers.

#### #verifyCoord([lon, lat])
Verifies whether a coordinate is legit (an actual point on the earth). Returns `false` if it's not legit, `true` if it is. Also returns `true` if coord is too legit. 

#### #requireAll(folderPath)
'require()' for an entire folder. Returns an object with keys being extension-less filenames.

#### #getDuplicateNodes(features)
`features` is an array of GeoJSON features. Returns an array of coordinates that are duplicated within the feature set.
