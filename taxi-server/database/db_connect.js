const db = require("mysql");

const conn = db.createConnection({
  host: "localhost",
  pott: 3306,
  user: "taxi",
  password: "taxi",
  database: "taxi",
});

module.exports = conn;
