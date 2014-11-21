*WORK IN PROGRESS*

<a name="structure"/>
## Data structure

![](./docs/structure.png?raw=true)

### Objects

#### Nodes
#### Ways
#### Shapes
#### Periods

The original reason for having separate "periods" in addition to each shape having a start/end was that...

At the moment, periods still exist along with times for individual shapes.

#### Levels
Like traditional GIS "layers", except that they contain multiple types of shapes that can be style separately or together. A level contains objects of the same kind (point, line, or polygon) and of similar styling.

1. land
2. admin1
3. admin2
4. admin3
5. settlements
6. rivers
7. lakes

#### Types
Types are used for styling. Every shape belongs to a type. Examples:

* `admin1`: sovereignty, country, dependency, colony
* `admin2`: state, province, republic

### Changesets

Each Changeset has a list of **directives**. A directive tells the Atlastory API what changes were made on an object. A directive serves three purposes: (1) to instruct the Atlastory API to change the database; (2) as a record of what was changed; and (3) as a template to reverse changes.

With the exeption of importing a GeoJSON, each directive should represent 1 model query (i.e. add a node, edit a shape, etc.). Again, other than a GeoJSON import, there are no "bulk" directives that change many objects.

Each directive has an *action* (`add`,`edit`,`delete`,`split`) that is/was performed on the object.

* **action** -- `add`, `edit`, or `delete`
* **object** -- The object type (`node`, `way`, `shape`, `type`, `source`, `period`)
* **object_id** -- The ID of the changed object
* **data** -- A stringified JSON object for data of a shape, type, source, period.
* **geometry** -- A stringified coordinate array for a node or shape (if GeoJSON import)
* **way_nodes** -- Behaves differently depending on the object.
    * *way*: a list of node IDs to add/delete `345,678`
    * *node*: a list of wayId-sequenceId to add/delete `0-1234,1-2345`
* **shape_relations** -- Behaves differently depending on the object.
    * *shape*: a list of sequence-Type-role-id to add/delete `0-Way-outer-1234,1-Node-center-5678`
    * *node*,*way*: a list of shapeId-sequenceId to add/delete `0-1234,1-2345`

**Directive examples:**
| Action                              | Directive(s)                                                                                                                                            |
|-------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|
| Add completely new shape            | `add node n-1 geometry[0,0]<br/> add node n-2 geometry[0,0]<br/> add way w-3 way_nodes(n-1,n-2)<br/> add shape s-1 data{} shape_relations(Way-outer-w-3)` |
| Edit shape data                     | `edit shape %SHAPE data{}`                                                                                                                                |
| Delete way + non-shared nodes       | `delete way %WAY data{} way_nodes(%NODE,%NODE)`                                                                                                           |
| Add node into way (mid-sequence)    | `add node n-1 geometry[0,0] way_nodes(%SEQ-%WAY)`                                                                                                         |
| Edit node location                  | `edit node %NODE geometry[0,0]`                                                                                                                           |
| Delete node in shape                | `delete node %NODE geometry[0,0] way_nodes(%SEQ-%WAY) || shape_relations(%SEQ-%SHAPE)`                                                                    |
| Add new way to existing shape       | `add node n-1 geometry[0,0]<br/> add node n-2 geometry[0,0]<br/> add way w-3 way_nodes(n-1,n-2)<br/> edit shape %SHAPE shape_relations(2-Way-outer-w-3)`  |
| Remove way from 1 shape only        | `delete shape %SHAPE shape_relation(5-Way-outer-%WAY)`                                                                                                    |
| Delete shape (relations must be removed first)        | `delete shape %SHAPE`                                                                                                    |
| Link existing way to existing shape | `edit shape %SHAPE shape_relation(2-Way-outer-%WAY)`                                                                                                      |
| Link existing way to new shape      | `add shape s-3 data{} shape_relations(0-Way-outer-%WAY)`  

---------------------------------
## Utilities

#### #replace()
#### #promiseSeries()
#### #mapPromise()
#### #verifyCoord()
#### #isBigint()
#### #requireAll()
#### #getDuplicateNodes()

---------------------------------
## Glossary

#### Relations
Connects a shape to a Node or Way. Used to create a new Shape, or to retrieve which objects a Shape is connected to.

In the `shape_relations` database table:
```
shape_id: 1233
relation_type: 'Node' | 'Way'
relation_id: 23411
relation_role: 'outer' | 'inner' | 'line' | 'point' | 'center',
sequence_id: 4
```

#### Node sharing
#### Shape splitting
