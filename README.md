# Atlastory: API

Atlastory is an interactive map that chronicles the history of life on earth. The API is a JSON-based RESTful interface for editing and retrieving map data.

![](https://github.com/atlastory/ideology/blob/master/_img/Atlastory-Stack-API.png?raw=true)

This repo contains the MVC-based API codebase (including full documentation) and database structure for all map data. Check out the [Atlastory Roadmap](https://github.com/atlastory/ideology/blob/master/Roadmap.md) for more on how the API fits into the Atlastory infrastructure.

## Install

The API is a Node.js application, so make sure [you have it installed](http://anotheruiguy.gitbooks.io/nodeexpreslibsass_from-scratch/content/node-npm.html). To access or edit data on your own database, read "[Creating the database](https://github.com/atlastory/api/blob/master/db/README.md)" first.

```sh
git clone git@github.com:atlastory/api.git
cd api
npm install
# Make sure databases are created
npm start
```

## Getting started

The official Atlastory-hosted API is live at [api.atlastory.com](http://api.atlastory.com/). See the [API Documention](./docs/index.md) for more on accessing map data through the RESTful interface. Here's a quick demo using cURL:

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

## Development

* [API Roadmap](ROADMAP.md)
* [Contributing](CONTRIBUTING.md)
* [Architecture](ARCHITECTURE.md)

For questions and community discussion, head to the [Atlastory Google Group](http://forum.atlastory.com/).

## License

The Atlastory API is licensed under the [New BSD](http://opensource.org/licenses/BSD-3-Clause) License. See [LICENSE](LICENSE) for more details.
