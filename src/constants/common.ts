import { requireStringEnvVariable } from "../utils/config/envUtils";

export const ENCRYPTION_KEY = requireStringEnvVariable("COMMON_ENCRYPTION_KEY");
export const JWT_SECRET = requireStringEnvVariable("COMMON_JWT_SECRET");
