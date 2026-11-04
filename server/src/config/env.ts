import dotenv from "dotenv";

dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";

// Conditional database naming based on environment
const defaultDbName = isProduction ? "uemp_prod_db" : "uemp_dev_db";

const dbName = process.env.DB_NAME || defaultDbName;

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: nodeEnv,
  IS_PROD: isProduction,
  API_PREFIX: process.env.API_PREFIX || "/api/v1",
  DB_NAME: dbName,
  MONGO_URI: process.env.MONGO_URI || `mongodb://127.0.0.1:27017/${dbName}`,
  JWT_SECRET:
    process.env.JWT_SECRET ||
    "uemp-education-portal-secure-jwt-access-secret-2026",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET ||
    "uemp-education-portal-secure-jwt-refresh-secret-2026",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
};
