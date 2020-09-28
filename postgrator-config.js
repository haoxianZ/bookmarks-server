require('dotenv').config();

module.exports = {
    "migrationDirectory": "migrations",
    "driver": "pg",
    'validateChecksums': false,
  "connectionString": (process.env.NODE_ENV === 'test')
     ? process.env.TEST_DataBase_URL
     : process.env.DataBase_URL,
  }