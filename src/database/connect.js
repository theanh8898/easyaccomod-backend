const mysql = require('mysql2');

let pool;

async function getConnection() {
  if (!pool) {
    pool = await mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'easyaccomod_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    }).promise();
  }
  return pool;
}

module.exports = getConnection;
