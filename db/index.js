const { Pool } = require("pg");
const db = new Pool({
    connectionString:
        process.env.DATABASE_URL ||
        "postgres://dkb@localhost:5432/acme_world_travel_review_db",
});

// async function query(sql, params, callback) {
//     return db.query(sql, params, callback);
// }

module.exports = { db };