import { DataSource, DataSourceOptions, DatabaseType } from "typeorm";
import path from "path";

function envLoad(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is missing`);
  }
  return value;
}

export const dbConfig = {
  type: envLoad("DATABASE_TYPE") as DatabaseType,
  url: envLoad("DATABASE_URL"),
  entities: [path.join(__dirname, "../entities/**/*.{ts,js}")],
  migrations: [path.join(__dirname, "../migrations/**/*.{ts,js}")],
  migrationsTableName: "migrations",
  synchronize: envLoad("DB_SYNC") === "true",
  logging: envLoad("TYPEORM_LOGGING") === "true",
} as DataSourceOptions;

export const connectDB = new DataSource(dbConfig);
