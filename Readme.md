# Atlastory API

## Data structure

Nodes

Ways

Shapes

Periods

Types

## Codebase concepts

#### Relations

Connects a shape to a Node or Way. Used to create (finish) a new Shape, or to retrieve which objects a Shape is connected to.

In the API codebase:
```js
relation = {
    type: 'Node' | 'Way',
    id: 23411,
    role: 'outer' | 'inner' | 'point' | 'center',
    sequence: 4
};
```

In the `shape_relations` database table:
```
shape_id: 1233
relation_type: 'Node' | 'Way'
relation_id: 23411
relation_role: 'outer' | 'inner' | 'point' | 'center'
sequence_id: 4
```

The NWS Class (located at `lib/NWS.js`) is a simple helper for storing and retrieving relation objects.

#### Directives

Each Changeset has a list of directives. 