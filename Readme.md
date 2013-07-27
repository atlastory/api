# Atlastory API

## Layer

### geojson
`/v1/layer/:id/geojson?pid=:pid`

* __pid__ (required) -- period ID
* __bbox__ (optional) -- bounding box for geometries
* __z__ (optional) -- zoom level for geometry simplificaiton

### topojson
`/v1/layer/:id/topojson?pid=:pid`

Same options as GeoJSON.

## Shape

### get
`/v1/shape?`
