require("dotenv-safe").load();
var aes256 = require('aes256');

if (process.env.DB == 'pgsql') {
    var pg = require("knex")({
        client: "postgresql",
        connection: "postgres://" + process.env.DB_USER + ":" + process.env.DB_PASS + "@" + process.env.DB_HOST + ":" + process.env.DB_PORT + "/" + process.env.DB_DB + "",
        searchPath: [process.env.DB_DB, process.env.DB_SCHEMA],
        pool: {
            min: 0,
            max: 10
        }
    });
}

if (process.env.DB == 'mssql') {

    var password_decrypt = aes256.decrypt('itau', process.env.DB_PASS);

    const ConnectionString = require("mssql/lib/connectionstring");
    var pg = require("knex")({
        client: "mssql",
        connection: ConnectionString.resolve("mssql://" + process.env.DB_USER + ":" + password_decrypt + '@' +
            process.env.DB_HOST + ':' + process.env.DB_PORT + "/" + process.env.DB_DB + ""),
        pool: {
            min: 5,
            max: 100
        }
    })
};

module.exports = {
    pg
};