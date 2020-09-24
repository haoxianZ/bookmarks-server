require('dotenv').config();

module.exports = {
    "migrationDirectory": "migrations",
    "driver": "pg",
    'validateChecksums': false,
  "connectionString": (process.env.NODE_ENV === 'test')
     ? process.env.TEST_DB_URL
     : process.env.DB_URL,
  }