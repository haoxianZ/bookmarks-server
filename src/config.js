require('dotenv').config();

console.log('congfig', process.env.DATABASE_URL)
module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_TOKEN: process.env.API_TOKEN,
  TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://dunder_mifflin@localhost/bookmarks-test',
  DATABASE_URL: process.env.DATABASE_URL ||'postgres://quutzmxvpivgqu:22e56894ed12fc00d5937139c3a5fc186453a52d984d9b3a07f588b2818b886a@ec2-54-210-128-153.compute-1.amazonaws.com:5432/d831nl1i0c6i3b'
}
