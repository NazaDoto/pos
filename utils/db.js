import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();
export const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  user: process.env.MYSQL_USER || "root",
  password: process.env.ENV == "prod" ? process.env.MYSQL_PASSWORD : "2112",
  database: process.env.MYSQL_DATABASE || "pos",
});
