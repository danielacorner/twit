const faunadb = require("faunadb");

const faunaClient = new faunadb.Client({
  secret: process.env.FAUNA_DB_KEY,
});
module.exports = { faunaClient };
