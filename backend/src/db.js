const mysql = require("mysql2");
require("dotenv").config();

// MySQL データベース接続設定
const pool = mysql.createPool({
  host: process.env.DB_HOST,       // データベースのホスト名（例: localhost）
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,       // MySQLのユーザー名
  password: process.env.DB_PASSWORD, // MySQLのパスワード
  database: process.env.DB_NAME,   // 使用するデータベース名
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise();
