# Changesets

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
| Delete node in shape                | `delete node %NODE geometry[0,0] way_nodes(%SEQ-%WAY)`<br/>OR `     shape_relations(%SEQ-%SHAPE)`                                                                    |
| Add new way to existing shape       | `add node n-1 geometry[0,0]`<br/>`add node n-2 geometry[0,0]`<br/>`add way w-3 way_nodes(n-1,n-2)`<br/>`edit shape %SHAPE shape_relations(2-Way-outer-w-3)`  |
| Remove way from 1 shape only        | `delete shape %SHAPE shape_relation(5-Way-outer-%WAY)`                                                                                                    |
| Delete shape (relations must be removed first)        | `delete shape %SHAPE`                                                                                                    |
| Link existing way to existing shape | `edit shape %SHAPE shape_relation(2-Way-outer-%WAY)`                                                                                                      |
| Link existing way to new shape      | `add shape s-3 data{} shape_relations(0-Way-outer-%WAY)`  

## Uploading a Changeset (i.e. making a contribution)

1. Create Changeset `POST /changesets`
    * Needs to be signed in for OAuth
2. Upload Directives and commit Changeset `POST /changesets/:id/commit`
    * `{ message: "", directives: [...] }`
    * Requires commit message if not already posted

```sh
# Create new changeset
$ curl -X POST \
       -d "user_id=0" \
       -d 'message="Adding new period"' \
       http://api.atlastory.com/changesets
> {"id":"1","response":"Changeset created"}

# Add a new period using directives
$ curl -X POST \
       -H "Content-Type: application/json" \
       -d '{"directives":[{"action":"add", "object":"period", "object_id":"p-1", "data":{"start_year":1992, "end_year":2010}}]}' \
       http://api.atlastory.com/changesets/1/commit
> [{"directive":"add period 2 data(start_year = 1992, end_year = 2010, start_day = 1, start_month = 1, end_day = 1, end_month = 1)","status":"success"}]
```