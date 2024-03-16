import winston from "winston";
import {
  getBooleanEnvVariableOrDefault,
  getStringEnvVariableOrDefault,
} from "../config/envUtils";

interface LogColors {
  info: string;
  debug: string;
  warn: string;
  error: string;
}

const colors: LogColors = {
  info: "\x1b[32m",
  debug: "\x1b[36m",
  warn: "\x1b[33m",
  error: "\x1b[31m",
};

const resetColor = "\x1b[0m";

const coloredFormatter = winston.format.printf(
  ({ level, message, timestamp }) => {
    const color = colors[level as keyof LogColors] || "";
    return `${color}[${timestamp}] ${level.toUpperCase()}${resetColor} - ${message}`;
  }
);

const logLevel = getStringEnvVariableOrDefault("COMMON_LOG_LEVEL", "info");
const logToConsole = getBooleanEnvVariableOrDefault(
  "COMMON_LOG_TO_CONSOLE",
  true
);
const logToFile = getBooleanEnvVariableOrDefault("COMMON_LOG_TO_FILE", false);
const logFile = getStringEnvVariableOrDefault(
  "COMMON_LOG_FILE_NAME",
  "app.log"
);

let transportsArray: winston.transport[] = [];

if (logToConsole) {
  transportsArray.push(new winston.transports.Console());
}

if (logToFile) {
  transportsArray.push(new winston.transports.File({ filename: logFile }));
}

const loggerUtils = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(winston.format.timestamp(), coloredFormatter),
  transports: transportsArray,
});

export { loggerUtils };
