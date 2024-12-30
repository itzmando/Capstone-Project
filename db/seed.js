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
        user_id INT NOT NULL,
        username VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        profile_picture_url VARCHAR(255) NOT NULL,
        bio TEXT NOT NULL,
        country VARCHAR(100) NOT NULL,
        created_at TIMESTAMP NOT NULL,
        last_login TIMESTAMP


      );

    CREATE TABLE bookmarks (
        user_id SERIAL REFERENCES users(id) NOT NULL,
        place_id SERIAL REFERENCES place(id) NOT NULL,
        created_at TIMESTAMP NOT NULL,
        notes TEXT NOT NULL,
        PRIMARY KEY (user_id, place_id)


      );

    CREATE TABLE categories (
        id SERIAL PRIMARY KEY,
        category_id INT NOT NULL,
        name VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        icon_url VARCHAR(255) NOT NULL
    
        
      );

    CREATE TABLE countries (
        id SERIAL PRIMARY KEY,
        country_id INT NOT NULL,
        name TEXT NOT NULL,
        continent TEXT NOT NULL
    
        
      );

    CREATE TABLE operating (
      place_id SERIAL REFERENCES place(id) NOT NULL,
      day_of_week INT NOT NULL,
      open_time TIME NOT NULL,
      close_time TIME NOT NULL,
      is_closed BOOLEAN NOT NULL,
      primary_key (place_id, day_of_week)

      );

     CREATE TABLE cities (
        id SERIAL PRIMARY KEY,
        city_id INT NOT NULL,
        country_id SERIAL REFERENCES country(id) NOT NULL,
        name VARCHAR(100) NOT NULL,
        state_province VARCHAR(100) NOT NULL,
        latitude DECIMAL NOT NULL,
        longitude DECIMAL NOT NULL,
        timezone VARCHAR(50) NOT NULL,
        population INT NOT NULL
        
      );
    

    CREATE TABLE places (
        id SERIAL PRIMARY KEY,
        place_id INT NOT NULL,
        category_id SERIAL REFERENCES category(id) NOT NULL,
        city_id SERIAL REFERENCES city(id) NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        address TEXT NOT NULL,
        latitude DECIMAL NOT NULL,
        longitude DECIMAL NOT NULL,
        website_url VARCHAR NOT NULL,
        phone_number VARCHAR NOT NULL,
        price_level INT NOT NULL
        
      );



    CREATE TABLE reviews (
        id SERIAL PRIMARY KEY,
        review_id INT NOT NULL,
        user_id SERIAL REFERENCES user(id) NOT NULL,
        place_id SERIAL REFERENCES place(id) NOT NULL,
        rating INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        visit_date DATE NOT NULL,
        created_at TIME NOT NULL,
        updated_at TIME NOT NULL,
        comments VARCHAR(255) NOT NULL

      );

       CREATE TABLE photos (
        id SERIAL PRIMARY KEY,
        photo_id OBJECT NOT NULL,
        user_id SERIAL REFERENCES user(id) NOT NULL,
        place_id SERIAL REFERENCES place(id) NOT NULL,
        review_id SERIAL REFERENCES review(id) NOT NULL,
        photo_url VARCHAR(255) NOT NULL,
        caption TEXT NOT NULL,
        uploaded_at TIMESTAMP NOT NULL,
        is_featured BOOLEAN NOT NULL


      );



    CREATE TABLE comments_reviews (
        user_id SERIAL REFERENCES user(id) NOT NULL,
        review_id SERIAL REFERENCES review(id) NOT NULL,
        CONSTRAINT unique_user_id_and_review_id UNIQUE (user_id, review_id),
        is_helpful BOOLEAN NOT NULL,
        commented_at TIMESTAMP NOT NULL,
        PRIMARY KEY (user_id, review_id)
        

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