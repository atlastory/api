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
}, {
    "properties": {
        "start_year": 1940, "start_month": 5, "start_day": 1,
        "end_year": 1945, "end_month": 4, "end_day": 25
    }
}
```

## Importing

## Exporting

