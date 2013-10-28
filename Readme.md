# Atlastory API

RESTful API with HTTP interface for reading and editing a map. Used by Atlastory map editor, but can be used by any third party editor with an API key.

## Routes

For the current beta version, all editing routes bypass the Wiki and make map edits directly.
```
GET     /layers          all layers for base map
GET     /layers/:id      single layer
POST    /layers/:id      creates layer in Wiki
PUT     /layers/:id      updates layer in Wiki
DELETE  /layers/:id      deletes layer in Wiki

GET     /layers/:id/geojson
        /geojson                GeoJSON of layer
GET     /layers/:id/topojson
        /topojson               TopoJSON of layer

GET     /layers/:id/shapes/:id  full GeoJSON for shape
GET		/layers/:id/shapes		gets all shapes for a specified period

```
