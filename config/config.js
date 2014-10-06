var env = process.env;
var mode = env.ENV || env.ENV_VARIABLE || env.NODE_ENV || "development";

module.exports = {
    env: mode,

    database: {
        "host": env.DB_HOST || "localhost",
        "port": env.DB_PORT || 5432,
        "database": env.DB_DATABASE || "atlastory",
        "username": env.DB_USER || "",
        "password": env.DB_PASS || "",
        "test": env.DB_TEST || "test"
    },

    // Switch for 'test' database
    testing: (env.TEST || mode == "test"),

    // Debug mode -- turns on detailed error reporting
    debug: (env.DEBUG || mode == "debug"),
};
