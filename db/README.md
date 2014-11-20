## Atlastory Database

[>> Structure](../ARCHITECTURE.md#structure)

### Creating the database

Using Postgres, create the databases `atlastory` (production) and `atlastory_test` for testing:

```sql
psql -h localhost
CREATE USER postgres SUPERUSER;
CREATE DATABASE atlastory WITH OWNER postgres;
CREATE DATABASE atlastory_test WITH OWNER postgres;
```

Then in your `atlastory-api` folder, run:

    node bin/migrate.js

Which will create the structure of the database. Running `node bin/migrate.js init -F` will clear out all current data and reload structure & data seeds. *Don't do this on your main database unless it's backed up!*

To run migrations on the **test** database, run `export ENV=test; ./bin/migrate.js`.
