import { Pool, PoolConfig, QueryResult } from "pg";
import {
  getStringEnvVariableOrDefault,
  getBooleanEnvVariableOrDefault,
  getStringEnvVariable,
} from "../config/envUtils";
import { loggerUtils } from "../logger/loggerUtils";
import fs from "fs";
import path from "path";

const postgresConfig: PoolConfig = {
  user: getStringEnvVariableOrDefault("COMMON_POSTGRES_USER", "postgres"),
  host: getStringEnvVariableOrDefault("COMMON_POSTGRES_HOST", "localhost"),
  database: getStringEnvVariableOrDefault("COMMON_POSTGRES_DB", "postgres"),
  password: getStringEnvVariableOrDefault(
    "COMMON_POSTGRES_PASSWORD",
    "password"
  ),
  port: parseInt(getStringEnvVariableOrDefault("COMMON_POSTGRES_PORT", "5432")),
  ssl: getBooleanEnvVariableOrDefault("COMMON_POSTGRES_ENABLE_SSL", false)
    ? {
        rejectUnauthorized: getBooleanEnvVariableOrDefault(
          "COMMON_POSTGRES_REJECT_UNAUTHORIZED",
          true
        ),
        ca: [
          fs.readFileSync(
            getStringEnvVariableOrDefault("COMMON_POSTGRES_CA_PATH", "")
          ),
        ],
        key: fs.readFileSync(
          getStringEnvVariableOrDefault("COMMON_POSTGRES_KEY_PATH", "")
        ),
        cert: fs.readFileSync(
          getStringEnvVariableOrDefault("COMMON_POSTGRES_CERT_PATH", "")
        ),
      }
    : false,
};

const pool = new Pool(postgresConfig);

export async function query<T extends QueryResult = any>(
  text: string,
  values?: any[]
): Promise<QueryResult<T>> {
  try {
    const start = Date.now();
    const result = await pool.query<T>(text, values);
    const duration = Date.now() - start;
    loggerUtils.debug(
      `postgresUtils :: query :: Query executed in ${duration}ms :: ${text}`,
      values
    );
    return result;
  } catch (error) {
    loggerUtils.error(
      `postgresUtils :: query :: Error executing query :: ${error}`
    );
    throw error;
  }
}

export async function connectPool(): Promise<void> {
  try {
    await pool.connect();
    loggerUtils.info(
      "postgresUtils :: connectPool :: PostgreSQL Connection Pool Connected"
    );
  } catch (error) {
    loggerUtils.error(
      `postgresUtils :: closePool :: Error closing PostgreSQL connection pool :: ${error}`
    );
    throw error;
  }
}

export async function closePool(): Promise<void> {
  try {
    await pool.end();
    loggerUtils.info(
      "postgresUtils :: closePool :: PostgreSQL Connection Pool Closed"
    );
  } catch (error) {
    loggerUtils.error(
      `postgresUtils :: closePool :: Error closing PostgreSQL connection pool :: ${error}`
    );
    throw error;
  }
}

export async function runMigrations(directoryPath: string): Promise<void> {
  try {
    const migrationPath = getStringEnvVariable(
      "COMMON_POSTGRES_MIGRATION_PATH"
    ) as string;

    if (migrationPath) {
      const files = fs.readdirSync(migrationPath);

      for (const file of files) {
        const filePath = path.join(directoryPath, file);
        const sql = fs.readFileSync(filePath, "utf-8");
        await query(sql);

        loggerUtils.debug(
          `postgresUtils :: runMigrations :: Migrated: ${filePath}`
        );
      }

      loggerUtils.info(
        "postgresUtils :: runMigrations :: All migrations executed successfully."
      );
    }
  } catch (error) {
    loggerUtils.error(
      `postgresUtils :: runMigrations :: Error executing migrations :: ${error}`
    );
    throw error;
  }
}
