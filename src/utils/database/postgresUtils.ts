import { Pool, PoolConfig, QueryResult } from "pg";
import {
  getStringEnvVariableOrDefault,
  getBooleanEnvVariableOrDefault,
} from "../config/envUtils";
import { loggerUtils } from "../logger/loggerUtils";
import fs from "fs";

const postgresConfig: PoolConfig = {
  user: getStringEnvVariableOrDefault("COMMON_POSTGRES_USER", "postgres"),
  host: getStringEnvVariableOrDefault("COMMON_POSTGRES_HOST", "localhost"),
  database: getStringEnvVariableOrDefault("COMMON_POSTGRES_DB", "postgres"),
  password: getStringEnvVariableOrDefault("COMMON_POSTGRES_PASSWORD", ""),
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
      "postgresUtils :: query :: Error executing query :: ",
      error
    );
    throw error;
  }
}

export async function connectPool(): Promise<void> {
  try {
    await pool.connect();
    loggerUtils.info("postgresUtils :: connectPool :: PostgreSQL Pool");
  } catch (error) {
    loggerUtils.error(
      "postgresUtils :: closePool :: Error closing PostgreSQL connection pool :: ",
      error
    );
    throw error;
  }
}

export async function closePool(): Promise<void> {
  try {
    await pool.end();
    loggerUtils.info(
      "postgresUtils :: closePool :: PostgreSQL connection pool closed"
    );
  } catch (error) {
    loggerUtils.error(
      "postgresUtils :: closePool :: Error closing PostgreSQL connection pool :: ",
      error
    );
    throw error;
  }
}
