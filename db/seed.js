const { db } = require("../index");
const bcrypt = require('bcrypt');
const fs = require('fs').promises;
const path = require('path');
const {
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
} = require('./seedFunction');

const createSchema = async () => {
  try {
    console.log("Creating database schema...");
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');
    await db.query(schema);
    console.log("Database schema created successfully.");
  } catch (error) {
    console.error("Error creating schema:", error);
    throw error;
  }
};

const seed = async () => {
  try {
    console.log("Starting database seeding...");
    
    await createSchema();
    await seedCategories(db);
    await seedCountries(db);
    await seedCities(db);
    await seedUsers(db);
    await seedAdmins(db);
    await seedPlaces(db);
    await seedReviews(db);
    await seedPhotos(db);
    await seedBookmarks(db);
    
    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
};

module.exports = { seed };