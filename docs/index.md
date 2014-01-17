# Atlastory API Documentation


## Layer


### Get the list of layers

	http://api.atlastory.com/layers

Gets all layers for the base map.


### Get a single layer

	http://api.atlastory.com/layers/:id

Get an individual layer for given layer ID.


### Get shapes for a layer+period

	http://api.atlastory.com/layers/:lid/periods/:pid/shapes.:type
	http://api.atlastory.com/geojson?id=:id&pid=:pid

__Required parameters:__

* `lid` — layer ID
* `pid` — period ID
* `type` — `json`, `geojson`, or `topojson`.
	* "`json`" will return an array of only shape data with no geometry.
	* "`geojson`", "`topojson`" will return a Feature Collection of all geometries with only gid/name data.

__Optional parameters:__

* `bbox` — coordinates of a bounding box, bottom-left and top-right points (formatted as "x1,y1,x2,y2", or "west,south,east,north")
* `z` — zoom level of map for geometry simplification
* `callback`

Example:

	http://api.atlastory.com/layers/61/periods/1/shapes.geojson?bbox=-86.309,16.805,-71.631,25.324

Example: [Shape data JSON](/layers/1/periods/1/shapes.json)

Example: [GeoJSON with zoom](/layers/61/periods/1/shapes.geojson?z=0)

Example: [GeoJSON with bounding box](/layers/64/periods/1/shapes.geojson?bbox=-86.30859375,16.804541076383455,-71.630859375,25.3241665257384)

### Get the TopoJSON of a layer

	http://api.atlastory.com/layers/:lid/periods/:pid/shapes.topojson
	http://api.atlastory.com/topojson?id=:id&pid=:pid

__Parameters:__ See GeoJSON above

Example: [TopoJSON with options](/layers/61/periods/1/shapes.topojson?z=0&bbox=-86.309,16.805,-71.631,25.324)



## Shape


### Get's data for a single shape

	http://api.atlastory.com/layers/:lid/periods/:pid/shapes/:sid.:type

Gets data and/or geometry for an individual shape with the given layer and shape IDs.

__Required parameters:__

* `lid` — Layer ID
* `sid` — Shape ID
* `type` — `json`, `geojson`, or `topojson`. "`json`" will return an array of only the shape's data with no geometry.

[Example](/layers/1/periods/1/shapes/1.geojson):

	http://api.atlastory.com/layers/1/periods/1/shapes/1.geojson
