// Clear and repopulate the database.

const db = require("./index");
const { faker } = require("@faker-js/faker");

async function seed() {
    console.log("Seeding the database.");
    try {
        // Clear the database.
        await db.query("DROP TABLE IF EXISTS users, placestovisit, comments, reviews, categories, likes/favorites;");

        // Recreate the tables
        await db.query(`
            
            
    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        userid INT NOT NULL,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) UNIQUE NOT NULL,
        password STRING UNIQUE NOT NULL


      );


    CREATE TABLE placestovisit (
        id SERIAL PRIMARY KEY,
        city STRING NOT NULL,
        borabora STRING NOT NULL,
        venice STRING NOT NULL,
        rome STRING NOT NULL,
        egypt STRING NOT NULL
        
      );



    CREATE TABLE reviews (
        userId INT NOT NULL,
        review VARCHAR(255) NOT NULL,
        commentid VARCHAR(255) NOT NULL,
        rating INT NOT NULL,
        photos OBJECT NOT NULL

      );

    CREATE TABLE comments (
        userId SERIAL REFERENCES users(id) NOT NULL,
        review_id SERIAL REFERENCES reviews(id) NOT NULL,
        CONSTRAINT unique_user_id_and_review_id UNIQUE (user_id, review_id),
        id VARCHAR(255) NOT NULL,
        rating INT NOT NULL

      );

    CREATE TABLE categories (
        id SERIAL PRIMARY KEY,
        spring STRING NOT NULL,
        summer STRING NOT NULL,
        fall STRING NOT NULL,
        winter STRING NOT NULL
    
        
      );

     CREATE TABLE likes/favorites (
        user_id SERIAL REFERENCES users(id) NOT NULL,
        placesId VARCHAR(255) NOT NULL,
        id INT NOT NULL

        
      );


    `);

    } catch (err) {
        console.error(err);
    }

}

// Seed the database if we are running this file directly.
if (require.main === module) {
    seed();
}

module.exports = seed;