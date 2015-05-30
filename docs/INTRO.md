# Atlastory API Documentation

Atlastory is an interactive map that chronicles the history of life on earth. The API is a JSON-based RESTful interface for editing and retrieving map data.

***Note:*** This API is a work in progress. It currently has limited functionality, including basic storage and retrieval geographic data. Atlastory is open source: [help contribute to the API here](https://github.com/atlastory/api).

Here's a quick demo using cURL:

```sh
# Get data for an individual level:
$ curl api.atlastory.com/levels/land
> {
    "id": 1,
    "name": "land",
    "level": 1,
    "created_at": "2014-11-22T02:04:14.676Z",
    "updated_at": "2014-11-22T02:04:14.676Z",
    "types": [{
      "id": 1,
      "name": "land",
      "color_1": "",
      "color_2": ""
    }]
  }

# Get a GeoJSON of the land level for the year 1999:
$ curl api.atlastory.com/year/1999/land.geojson
> {
    "type": "FeatureCollection",
    "features": [...]
  }

```

