# Atlastory API Documentation


## Layer


### Get the list of layers

	http://api.atlastory.com/layers

Gets all layers for the base map.


### Get a single layer

	http://api.atlastory.com/layers/:id

Get an individual layer for given layer ID.


### Get the GeoJSON of a layer

	http://api.atlastory.com/layers/:id/geojson
	http://api.atlastory.com/geojson?id=:id

__Required parameters:__

* `pid` — period ID

__Optional parameters:__

* `bbox` — coordinates of a bounding box, bottom-left and top-right points (formatted as "x1,y1,x2,y2", or "west,south,east,north")
* `z` — zoom level of map for geometry simplification

Example:

	http://api.atlastory.com/layers/61/geojson?pid=1&bbox=-86.309,16.805,-71.631,25.324

Example: [GeoJSON with zoom](/layers/61/geojson?pid=1&z=0)

Example: [GeoJSON with bounding box](/layers/61/geojson?pid=1&bbox=-86.30859375,16.804541076383455,-71.630859375,25.3241665257384)

### Get the TopoJSON of a layer

	http://api.atlastory.com/layers/:id/topojson
	http://api.atlastory.com/topojson?id=:id

__Parameters:__ See GeoJSON above

Example: [TopoJSON with bounding box](/layers/61/topojson?pid=1&bbox=-86.309,16.805,-71.631,25.324)



## Shape


### Get the GeoJSON for a single shape

	http://api.atlastory.com/layers/:id/shapes/:id

Gets full GeoJSON for an individual shape with the given layer and shape IDs.
