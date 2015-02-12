# Contributing to the Atlastory API

For coding and development discussion, head to the [Gitter atlastory/api](https://gitter.im/atlastory/api) room.

### Choosing something to work on
* Check out the [issue tracker](https://github.com/atlastory/api/issues?q=is%3Aopen+is%3Aissue+no%3Aassignee) for both **features** (*enhancements*) to add and **bugs** to fix.
* In order to avoid overlap, it's always a good idea to comment on the item and let everybody know that you want to work on it.
* Read over the list of Goals in the [ROADMAP document](ROADMAP.md) and think about adding an enhancement to the issue tracker that satisfies a Goal or improves an old one.

### Reporting bugs/issues
* [Search for the issue](https://github.com/search?q=repo%3Aatlastory%2Fapi&type=Issues) before filing it, as it may have already been reported
* Include steps to replicate the bug: *When did it happen? What did you expect to happen? What happened instead?*
* __If running on Atlastory production server__: Include the error message & cURL command to reproduce the result.
* __If running locally or on your own servers__: Include the error message with stack trace, your configuration & test results.
* Be friendly and respectful! Nobody likes bugs :smile:

### Testing
* Include tests when adding new **features** or **enhancements**.
* When fixing **bugs**, add or edit a test that highlights how the current behavior is broken.
* With your tests, ask: *How could a user break this? How does this handle incorrect inputs? What happens at the limits?*
* Make sure all tests (`npm test`) pass before committing.

### Committing changes & creating a pull request
1. Make sure it's something that needs to be done from the issue tracker.
2. Make your pull requests as small as necessary to solve the problem. (Split up large patches into smaller units of functionality.)
3. Create a fork in GitHub.
4. Create a branch off the `develop` branch. (It's best to name the branch something that makes sense like `issue-123` or `new-feature-456`.)
5. Commit your changes and push them to GitHub.
6. Create a pull request against the main repository's `develop` branch.

## Language and style

* **JavaScript**: see [Learn JavaScript](http://gitbookio.gitbooks.io/javascript/) and [Eloquent JavaScript](http://eloquentjavascript.net/).
* We primarily use the [Airbnb JavaScript styleguide](https://github.com/airbnb/javascript)
* For an good introduction to **[Node.js](http://nodejs.org/)**, see the GitBook [Node, Express project from scratch](http://anotheruiguy.gitbooks.io/nodeexpreslibsass_from-scratch/).
* We use **promises** for most flow control. See [the Q documentation](https://github.com/kriskowal/q/blob/v1/README.md), [API Reference](https://github.com/kriskowal/q/wiki/API-Reference) and [Promises in Node.js](http://strongloop.com/strongblog/promises-in-node-js-with-q-an-alternative-to-callbacks/) for more.
* In general, try to match the surrounding coding style of whatever edits you make.

## Application structure

* [Application Architecture](ARCHITECTURE.md)
* [API Documentation](docs/index.md)

#### Routing
Using **Grand Central Junction (GCJ)**, all routes are handled in `config/routes.js`. Path expressions and functions follow the usual Express style. See [GCJ docs](https://github.com/maxprogram/grand-central-junction/blob/master/Readme.md) for more.

#### Database access (Object-relational mapping)
The API uses **Grand Central Records (GCR)**, an ORM/Active Record library built concurrently with the API. GCR is used extensively throughout the application and is heavily relied upon. [See the documentation](https://github.com/maxprogram/grand-central-records/blob/master/README.md) for more. GCR is also a work in progress, so if you find a bug please [report it](https://github.com/maxprogram/grand-central-records/issues) or make a contribution yourself.

#### Error handling
Error handling is performed through `lib/errors.js`. 

#### Views & templating
@TODO

#### API Documentation
@TODO

### Database management
Database management is similar to Ruby on Rails, except managed "manually" and in raw SQL.

* **Structure** `db/structure.sql` -- Contains the complete, current version of the Atlastory Postgres database. Must stay up-to-date at all times.
* **Seeds** `db/seeds.sql` -- Initial database seed data, primarily for testing.
* **Migrations** `db/migrate/x.y.z#migration-name.sql` -- Any change to the database in `structure.sql` should also be added as a separate migration updating the existing database (adding/modifying tables, indexes, functions, etc.). Follow the naming convention of `semver#name` with semver being the current API semantic version, and name being a 1-5 word hyphenated description of the update.
