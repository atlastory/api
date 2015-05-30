# Working with GeoJSONs

Maps can be imported and exported using the [GeoJSON Specification](http://geojson.org/geojson-spec.html).

```json
{
    "type": "Feature",
    "properties": {},
    "geometry": {
        "type": "",
        "coordinates": []
    },
    "when": {
        "start": "",
        "stop": ""
    }
}
```

#### Time specification
When importing a GeoJSON, the API first looks under `when` for a FeatureCollection *or* individual Feature following [these proposed specifications](https://github.com/geojson/geojson-ld/blob/master/time.md). If `when` isn't there, the properties of `start_year` and `end_year` for individual Features are used (along with months and days). The following are equivalent when importing:
```js
{ ...
    "when": { "start": "1940-05-01", "stop": "1945-04-25" }
}
==
{ ...
    "properties": {
        "start_year": 1940, "start_month": 5, "start_day": 1,
        "end_year": 1945, "end_month": 4, "end_day": 25
    }
}
```

## Importing

Importing a raw GeoJSON follows a typical [Changeset commit](), but instead of directives, the period, type and GeoJSON are posted to the changeset.

1. `POST /changesets?user_id=0`
2. `POST /changesets/:id/commit`
    * **[message]**: new or updated commit message.
    * **geojson**: JSON object/string, or GeoJSON file upload (multipart/form-data).
    * **type**: ID of object type for GeoJSON features.
    * **period**: ID of period for the GeoJSON. For now, a period ID is required. Start/stop dates of individual features are still recorded regardless of whether they match with start/stop dates of the period.

**An example using cURL:**
```sh
# Create new changeset
$ curl -X POST \
       -d "user_id=0" \
       http://api.atlastory.com/changesets
> {"id":"1","response":"Changeset created"}

# Import 'data.geojson' file to API
$ curl -X POST \
       -F 'message="Import GeoJSON"' \
       -F "period=1" \
       -F "type=1" \
       -F "geojson=@data.geojson" \
       http://api.atlastory.com/changesets/1/commit
> [{"directive":"add shape 1 data()","status":"success"}]
```

## Exporting

Building large GeoJSON files may take a while at the moment. Eventually streaming & geometric simplification will be enabled.

**An example using cURL:**
```sh
# Export period 1 type 1 GeoJSON to local 'export.geojson' file
$ curl -o export.geojson \
       http://api.atlastory.com/periods/1/1.geojson

# Export land GeoJSON from 1999 to local '1999.geojson' file
$ curl -o 1999.geojson \
       http://api.atlastory.com/year/1999/land.geojson
```
