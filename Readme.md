# Atlastory API

RESTful API with HTTP interface for reading and editing a map. Used by Atlastory map editor, but can be used by any third party editor with an API key.

## Routes

For the current beta version, all editing routes bypass the Wiki and make map edits directly.
```
GET     /map/:id/layer          all layers for map
GET     /map/:id/layer/:id      single layer
POST    /map/:id/layer/:id      creates layer in Wiki
PUT     /map/:id/layer/:id      updates layer in Wiki
DELETE  /map/:id/layer/:id      deletes layer in Wiki

GET     /map/:id/layer/:id/geojson
        /geojson                GeoJSON of layer
GET     /map/:id/layer/:id/topojson
        /topojson               TopoJSON of layer

GET     /layer/:id/s/:id        full GeoJSON for shape
POST    /layer/:id/s/:id        creates shape in Wiki (accepts GeoJSON)
PUT     /layer/:id/s/:id        updates shape in Wiki (accepts GeoJSON)
DELETE  /layer/:id/s/:id        deletes shape in Wiki (accepts GeoJSON)

```
