// Clear and repopulate the database.

const { db } = require("./index");


async function seed() {
  console.log("Seeding the database.");
  try {
    // Clear the database.
    await db.query("DROP TABLE IF EXISTS bookmarks, categories, cities, comments, countries, operating, photos, places, reviews, users;");


    // TODO choose id or user_id

    // Recreate the tables
    await db.query(`
            
        
   
    CREATE TABLE users (

        id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        user_id INT GENERATED ALWAYS AS (id) STORED,
        username VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        profile_picture_url VARCHAR(255),
        bio TEXT,
        country VARCHAR(100),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        last_login TIMESTAMP


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

  
     CREATE TABLE cities (
        id SERIAL PRIMARY KEY,
        city_id INT NOT NULL,
        country_id SERIAL REFERENCES countries(id) NOT NULL,
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
        category_id SERIAL REFERENCES categories(id) NOT NULL,
        city_id SERIAL REFERENCES cities(id) NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        address TEXT NOT NULL,
        latitude DECIMAL NOT NULL,
        longitude DECIMAL NOT NULL,
        website_url VARCHAR NOT NULL,
        phone_number VARCHAR NOT NULL,
        price_level INT NOT NULL
        
      );

    CREATE TABLE bookmarks (
        user_id SERIAL REFERENCES users(id) NOT NULL,
        place_id SERIAL REFERENCES places(id) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        notes TEXT,
        PRIMARY KEY (user_id, place_id)


      );

    CREATE TABLE operating (
      place_id SERIAL REFERENCES places(id) NOT NULL,
      day_of_week INT NOT NULL,
      open_time TIMESTAMP NOT NULL,
      close_time TIMESTAMP NOT NULL,
      is_closed BOOLEAN NOT NULL,
      PRIMARY KEY (place_id, day_of_week)

      );


    CREATE TABLE reviews (
        id SERIAL PRIMARY KEY,
        review_id INT NOT NULL,
        user_id SERIAL REFERENCES users(id) NOT NULL,
        place_id SERIAL REFERENCES places(id) NOT NULL,
        rating INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        visit_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL,
        comments VARCHAR(255) NOT NULL

      );

       CREATE TABLE photos (
        photo_id SERIAL PRIMARY KEY,
        user_id SERIAL REFERENCES users(id) NOT NULL,
        place_id SERIAL REFERENCES places(id) NOT NULL,
        review_id SERIAL REFERENCES reviews(id) NOT NULL,
        photo_url VARCHAR(255),
        caption TEXT NOT NULL,
        uploaded_at TIMESTAMP NOT NULL,
        is_featured BOOLEAN NOT NULL


      );



    CREATE TABLE comments (
        user_id SERIAL REFERENCES users(id) NOT NULL,
        review_id SERIAL REFERENCES reviews(id) NOT NULL,
        CONSTRAINT unique_user_id_and_review_id UNIQUE (user_id, review_id),
        is_helpful BOOLEAN NOT NULL,
        commented_at TIMESTAMP NOT NULL,
        PRIMARY KEY (user_id, review_id)
        

      );

      


    `);


    let category_id, country_id, city_id, latitude, longitude, population, place_id, day_of_week, review_id, rating, photo_id, price_level = 0;
    let is_featured = true;
    let is_helpful = true;
    let is_closed = true;
    let username, email, password_hash, full_name, profile_picture_url, bio, country, name, description, icon_url, continent,
      state_province, timezone, address, website_url, phone_number, notes, open_time, close_time, title,
      content, visit_date, comments, updated_at, photo_url, caption, uploaded_at, commented_at = ""

    const createData = async (numOfSeeds) => {

      for (let i = 0; i < numOfSeeds; i++) {
        username = `user${i}`, email = `userEmail${i}`, password_hash = `passwordHash${i}`, full_name = `fullName${i}`,

          profile_picture_url = `profile_picture_url${i}`, bio = `bio${i}`, country = `country${i}`,

          category_id = i + 1, name = `name${i}`, description = `description${i}`, icon_url = `iconUrl${i}`,

          country_id = i + 1, name = `name${i}`, continent = `continent${i}`,

          city_id = i + 1, name = `name${i}`, state_province = `state_province${i}`, latitude = i, longitude = i, timezone = `timezone${i}`, population = i,

          place_id = i + 1, name = `name${i}`, description = `description${i}`, address = `address${i}`, latitude = i, longitude = i, website_url = `websiteUrl${i}`,

          phone_number = `phoneNumber${i}`, price_level = i, notes = `notes${i}`, day_of_week = i,

          open_time = `2025-01-08  00:${i + 10}:00`, close_time = `2025-01-08  00:${i + 10}:00`, review_id = i + 1, rating = i,

          title = `title${i}`, content = `content${i}`, visit_date = `2025-01-${i + 10}`,

          updated_at = `2025-01-08  00:${i + 10}:00`, comments = `comments${i}`, photo_id = i + 1, photo_url = `photo_url${i}`, caption = `caption${i}`,

          uploaded_at = `2025-01-08  00:${i + 10}:00`, commented_at = `2025-01-08  00:${i + 10}:00`;


        await db.query(`
          INSERT INTO users(username, email, password_hash, full_name, profile_picture_url, bio, country)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        ;`, [username, email, password_hash, full_name, profile_picture_url, bio, country]);

        await db.query(`
          INSERT INTO categories(category_id, name, description, icon_url)
          VALUES ($1, $2, $3, $4)
          ;`, [category_id, name, description, icon_url]);

        await db.query(`
            INSERT INTO countries(country_id, name, continent)
            VALUES ($1, $2, $3)
            ;`, [country_id, name, continent]);

        await db.query(`
              INSERT INTO cities(city_id, country_id, name, state_province, latitude, longitude, timezone, population)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
              ;`, [city_id, country_id, name, state_province, latitude, longitude, timezone, population]);


        await db.query(`
              INSERT INTO places(place_id, name, description, address, latitude, longitude, website_url, phone_number, price_level)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
              ;`, [place_id, name, description, address, latitude, longitude, website_url, phone_number, price_level]);

        await db.query(`
              INSERT INTO bookmarks(notes)
              VALUES ($1)
              ;`, [notes]);

        await db.query(`
              INSERT INTO operating(day_of_week, open_time, close_time, is_closed)
              VALUES ($1, $2, $3, $4)
                ;`, [day_of_week, open_time, close_time, is_closed]);

        await db.query(`
              INSERT INTO reviews(review_id, rating, title, content, visit_date, updated_at, comments)
              VALUES ($1, $2, $3, $4, $5, $6, $7)
                ;`, [review_id, rating, title, content, visit_date, updated_at, comments]);

        await db.query(`
              INSERT INTO photos(photo_id, photo_url, caption, uploaded_at, is_featured)
              VALUES ($1, $2, $3, $4, $5)
                ;`, [photo_id, photo_url, caption, uploaded_at, is_featured]);

        await db.query(`
              INSERT INTO comments(is_helpful, commented_at)
              VALUES ($1, $2)
                ;`, [is_helpful, commented_at]);


      }

      // await createData(numOfSeeds);
      // console.log("Seeded")

    }
    await createData(10);
    console.log("Seeded")


  } catch (err) {
    console.error(err);
  }

}

// Seed the database if we are running this file directly.
if (require.main === module) {
  seed();
}

module.exports = seed;