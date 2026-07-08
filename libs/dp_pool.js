const mariadb = require('mariadb');

if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env');
}

const pool = mariadb.createPool({
    host: 'localhost',
    user: process.env.DATABASE_USER || process.env.DATABAE_USERNAME || process.env.DATABSE_USER,
    password: process.env.DATABASE_PASSWORD,
    port : Number(process.env.DATABASE_PORT || 3306),
    database: 'self_learning',
    connectionLimit : 5
});

module.exports = pool;
