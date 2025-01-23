const bcrypt = require('bcrypt');
const {
  categories,
  countries,
  cities,
  users,
  admins,
  places,
  reviews,
  photos,
  bookmarks
} = require('./data');


const seedCategories = async (db) => {
  try {
    for (const category of categories) {
      await db.query(`
        INSERT INTO categories (name, description, icon_url)
        VALUES ($1, $2, $3)
      `, [category.name, category.description, category.icon_url]);
    }
    console.log("Categories seeded successfully.");
  } catch (error) {
    console.error("Error seeding categories:", error);
    throw error;
  }
};

const seedCountries = async (db) => {
  try {
    for (const country of countries) {
      await db.query(`
        INSERT INTO countries (name, continent)
        VALUES ($1, $2)
      `, [country.name, country.continent]);
    }
    console.log("Countries seeded successfully.");
  } catch (error) {
    console.error("Error seeding countries:", error);
    throw error;
  }
};

const seedCities = async (db) => {
  try {
    for (const city of cities) {
      await db.query(`
        INSERT INTO cities (
          country_id, name, state_province, latitude, longitude, timezone, population
        )
        VALUES (
          (SELECT id FROM countries WHERE name = $1),
          $2, $3, $4, $5, $6, $7
        )
      `, [
        city.country,
        city.name,
        city.state,
        city.lat,
        city.lng,
        city.timezone,
        city.population
      ]);
    }
    console.log("Cities seeded successfully.");
  } catch (error) {
    console.error("Error seeding cities:", error);
    throw error;
  }
};


const seedUsers = async (db) => {
    try {
      const saltRounds = 10;
      for (const user of users) {
        const hashedPassword = await bcrypt.hash(user.password, saltRounds);
        await db.query(`
          INSERT INTO users (
            username, email, password_hash, full_name, country, role, is_verified, is_active
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          user.username,
          user.email,
          hashedPassword,
          user.full_name,
          user.country,
          user.role,
          true,
          true
        ]);
      }
      console.log("Users seeded successfully.");
    } catch (error) {
      console.error("Error seeding users:", error);
      throw error;
    }
  };

  const seedAdmins = async (db) => {
    try {
    for (const admin of admins) {
      await db.query(`
        INSERT INTO admins (
          user_id, department, can_add_reviews, can_edit_reviews,
          can_delete_reviews, can_moderate_reviews, reviews_added,
          reviews_edited, reviews_deleted, reviews_moderated,
          average_review_score, review_approval_rate, review_response_time,
          flagged_reviews_handled, review_categories_handled,
          preferred_categories, review_notes
        )
        VALUES (
          (SELECT id FROM users WHERE username = $1),
          $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
        )
      `, [
        admin.username,
        admin.department,
        admin.can_add_reviews,
        admin.can_edit_reviews,
        admin.can_delete_reviews,
        admin.can_moderate_reviews,
        admin.reviews_added,
        admin.reviews_edited,
        admin.reviews_deleted,
        admin.reviews_moderated,
        admin.average_review_score,
        admin.review_approval_rate,
        admin.review_response_time,
        admin.flagged_reviews_handled,
        admin.review_categories_handled,
        admin.preferred_categories,
        admin.review_notes
      ]);
    }
    console.log("Admins seeded successfully.");
} catch (error) {
    console.error("Error seeding admins:", error);
    throw error;
  }
};

const seedPlaces = async (db) => {
    try {
          for (const place of places) {
            const placeId = await db.query(`
              INSERT INTO places (
                category_id, city_id, name, description, address,
                latitude, longitude, website_url, phone_number, price_level,
                slug
              )
              VALUES (
                (SELECT id FROM categories WHERE name = $1),
                (SELECT id FROM cities WHERE name = $2),
                $3, $4, $5, $6, $7, $8, $9, $10,
                $11
              )
        RETURNING id
      `, [
        place.category,
        place.city,
        place.name,
        place.description,
        place.address,
        place.lat,
        place.lng,
        place.website,
        place.phone,
        place.price_level,
        place.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      ]);

      await seedOperatingHours(db, placeId.rows[0].id, place.name);
    }
    console.log("Places seeded successfully.");
} catch (error) {
    console.error("Error seeding places:", error);
    throw error;
  }
};

const seedOperatingHours = async (db, placeId, placeName) => {
    try {
      const customOperatingHours = {
        'Le Petit Bistrot': {
          1: { open: '11:30', close: '23:00', closed: false },
          2: { open: '11:30', close: '23:00', closed: false },
          3: { open: '11:30', close: '23:00', closed: false },
          4: { open: '11:30', close: '23:30', closed: false },
          5: { open: '11:30', close: '23:30', closed: false },
          6: { open: '11:30', close: '23:30', closed: false },
          0: { open: '12:00', close: '22:00', closed: false }
        },
        'Ocean View Seafood': {
          1: { open: '12:00', close: '22:00', closed: false },
          2: { open: '12:00', close: '22:00', closed: false },
          3: { open: '12:00', close: '22:00', closed: false },
          4: { open: '12:00', close: '23:00', closed: false },
          5: { open: '12:00', close: '23:30', closed: false },
          6: { open: '12:00', close: '23:30', closed: false },
          0: { open: '12:00', close: '21:00', closed: false }
        }
    };

    const customHours = customOperatingHours[placeName];

    for (let day = 0; day < 7; day++) {
        const hours = customHours ? customHours[day] : {
          open: '09:00',
          close: '22:00',
          closed: day === 0
        };
  
        await db.query(`
          INSERT INTO operating_hours (place_id, day_of_week, open_time, close_time, is_closed)
          VALUES ($1, $2, $3, $4, $5)
        `, [
          placeId,
          day,
          hours.open,
          hours.close,
          hours.closed
        ]);
      }
    } catch (error) {
      console.error("Error seeding operating hours:", error);
      throw error;
    }
  };

  const seedReviews = async (db) => {
    try {
      for (const review of reviews) {
        const reviewId = await db.query(`
            INSERT INTO reviews (
            user_id,
            place_id,
            rating,
            title,
            content,
            visit_date
            )
            VALUES (
            (SELECT id FROM users WHERE username = $1),
            (SELECT id FROM places WHERE name = $2),
            $3, $4, $5, $6
             )
            RETURNING id
            `, [
                review.username,
                 review.place_name,
                 review.rating,
                 review.title,
                 review.content,
                  review.visit_date
                ]);
                await db.query(`
                     UPDATE places
                      SET 
                       average_rating = (
                       SELECT AVG(rating)::DECIMAL(3,2)
                        FROM reviews
                        WHERE place_id = (SELECT id FROM places WHERE name = $1)
                        ),
                        review_count = (
                         SELECT COUNT(*)
                          FROM reviews
                          WHERE place_id = (SELECT id FROM places WHERE name = $1)
                           )
                           WHERE name = $1
                           `, [review.place_name]);
                        }
                        console.log("Reviews seeded successfully.");
                      } catch (error) {
                        console.error("Error seeding reviews:", error);
                        throw error;
                      }
                    };

 const seedPhotos = async (db) => {
  try {
    for (const photo of photos) {                   
await db.query(`
  INSERT INTO photos (
    user_id,
    place_id,
    photo_url,
    thumbnail_url,
    caption,
    metadata
  )
  VALUES (
    (SELECT id FROM users WHERE username = $1),
    (SELECT id FROM places WHERE name = $2),
    $3, $4, $5, $6
  )
`, [
  photo.username,
  photo.place_name,
  photo.photo_url,
  photo.thumbnail_url,
  photo.caption,
  photo.metadata
]);
}
console.log("Photos seeded successfully.");
} catch (error) {
console.error("Error seeding photos:", error);
throw error;
}
};

                    

const seedBookmarks = async (db) => {
    try {
      for (const bookmark of bookmarks) {
    await db.query(`
      INSERT INTO bookmarks (
        user_id,
        place_id,
        collection_name,
        notes
      )
      VALUES (
        (SELECT id FROM users WHERE username = $1),
        (SELECT id FROM places WHERE name = $2),
        $3, $4
      )
    `, [
      bookmark.username,
      bookmark.place_name,
      bookmark.collection_name,
      bookmark.notes
    ]);
}
console.log("Bookmarks seeded successfully.");
} catch (error) {
console.error("Error seeding bookmarks:", error);
throw error;
}
};



const seed = async () => {
try {
  console.log("Starting database seeding...");
  
  await seedCategories();
  await seedCountries();
  await seedCities();
  await seedUsers();
  await seedAdmins();
  await seedPlaces();
  await seedReviews();
  await seedPhotos();
  await seedBookmarks();
  
  console.log("Database seeding completed successfully!");
} catch (error) {
  console.error("Error seeding database:", error);
  throw error;
}
};

module.exports = {
seed,
seedCategories,
seedCountries,
seedCities,
seedUsers,
seedAdmins,
seedPlaces,
seedOperatingHours,
seedReviews,
seedPhotos,
seedBookmarks
}