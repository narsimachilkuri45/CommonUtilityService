import { getStringEnvVariableOrDefault } from "../utils/config/envUtils";

export const ENCRYPTION_KEY = getStringEnvVariableOrDefault(
  "COMMON_ENCRYPTION_KEY",
  "COMMON@123"
);

export const JWT_SECRET = getStringEnvVariableOrDefault(
  "COMMON_JWT_SECRET",
  "COMMON@123"
);
