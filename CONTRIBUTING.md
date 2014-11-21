# Contributing to the Atlastory API

*WORK IN PROGRESS* For questions and community discussion, head to the [Atlastory Google Group](http://forum.atlastory.com/).

## Language and style

* **JavaScript**: see [Learn JavaScript](http://gitbookio.gitbooks.io/javascript/) and [Eloquent JavaScript](http://eloquentjavascript.net/).
* We primarily use the [Airbnb JavaScript styleguide](https://github.com/airbnb/javascript)
* For an good introduction to **[Node.js](http://nodejs.org/)**, see the GitBook [Node, Express project from scratch](http://anotheruiguy.gitbooks.io/nodeexpreslibsass_from-scratch/).
* We use **promises** for most flow control. See [the Q documentation](https://github.com/kriskowal/q/blob/v1/README.md), [API Reference](https://github.com/kriskowal/q/wiki/API-Reference) and [Promises in Node.js](http://strongloop.com/strongblog/promises-in-node-js-with-q-an-alternative-to-callbacks/) for more.

## Contributing

### Reporting bugs/issues
### Committing changes
### Testing

## Application structure

* [Application Architecture](ARCHITECTURE.md)
* [API Documentation](docs/index.md)

#### Routing
Using **Grand Central Junction (GCJ)**, all routes are handled in `config/routes.js`. Path expressions and functions follow the usual Express style. See [GCJ docs](https://github.com/maxprogram/grand-central-junction/blob/master/Readme.md) for more.
#### Database access (Object-relational mapping)
The API uses **Grand Central Records (GCR)**, an ORM/Active Record library built concurrently with the API. GCR is used extensively throughout the application and is heavily relied upon. [See the documentation](https://github.com/maxprogram/grand-central-records/blob/master/README.md) for more. GCR is also a work in progress, so if you find a bug please [report it](https://github.com/maxprogram/grand-central-records/issues) or make a contribution yourself.
#### Error handling
#### Views & templating
#### API Documentation

### Database management
Database management is similar to Ruby on Rails, except managed "manually" and in raw SQL.

* **Structure** `db/structure.sql` -- Contains the complete, current version of the Atlastory Postgres database. Must stay up-to-date at all times.
* **Seeds** `db/seeds.sql` -- Initial database seed data, primarily for testing.
* **Migrations** `db/migrate/x.y.z#migration-name.sql` -- Any change to the database in `structure.sql` should also be added as a separate migration updating the existing database (adding/modifying tables, indexes, functions, etc.). Follow the naming convention of `semver#name` with semver being the current API semantic version, and name being a 1-5 word hyphenated description of the update.
