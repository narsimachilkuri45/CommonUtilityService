import mongoose, { Mongoose, ConnectOptions } from "mongoose";
import { envUtils } from "../config";
import { loggerUtils } from "../logger/loggerUtils";

let mongooseInstance: Mongoose | null = null;

export async function connect(): Promise<Mongoose> {
  try {
    const host = envUtils.getStringEnvVariableOrDefault(
      "COMMON_MONGODB_HOST",
      "localhost"
    );

    const port = envUtils.getNumberEnvVariableOrDefault(
      "COMMON_MONGODB_PORT",
      27017
    );

    const connectionURI = `mongodb://${host}/${port}`;

    const options: ConnectOptions = {
      autoIndex: true,
      autoCreate: true,
      dbName: envUtils.getStringEnvVariableOrDefault(
        "COMMON_MONGODB_DATABASE",
        "admin"
      ),
      authSource: envUtils.getStringEnvVariableOrDefault(
        "COMMON_MONGODB_AUTH_SOURCE",
        "admin"
      ),
    };

    const username = envUtils.getStringEnvVariable("COMMON_MONGODB_USERNAME");
    const password = envUtils.getStringEnvVariable("COMMON_MONGODB_PASSWORD");

    if (username && password) {
      options.auth = { username, password };
    }

    const tlsCAFile = envUtils.getStringEnvVariable(
      "COMMON_MONGODB_TLS_CA_FILE"
    );
    const tlsCertificateKeyFile = envUtils.getStringEnvVariable(
      "COMMON_MONGODB_TLS_CERTIFICATE_KEY_FILE"
    );

    if (tlsCAFile && tlsCertificateKeyFile) {
      options.tls = true;
      options.tlsCAFile = tlsCAFile;
      options.tlsCertificateKeyFile = tlsCertificateKeyFile;
    }

    mongooseInstance = await mongoose.connect(connectionURI, options);
    loggerUtils.info("mongoUtils :: connect :: Connected to MongoDB");
    return mongooseInstance;
  } catch (error) {
    loggerUtils.error(
      `mongoUtils :: connect :: Error connecting to MongoDB :: ${error}`
    );
    throw error;
  }
}

export async function disconnect(): Promise<void> {
  try {
    if (mongooseInstance) {
      await mongooseInstance.disconnect();
      loggerUtils.info("mongoUtils :: disconnect :: Disconnected from MongoDB");
    }
  } catch (error) {
    loggerUtils.error(
      `mongoUtils :: disconnect :: Error disconnecting to MongoDB :: ${error}`
    );
    throw error;
  }
}

export function getConnection(): Mongoose | null {
  try {
    return mongooseInstance;
  } catch (error) {
    loggerUtils.error(
      `mongoUtils :: getConnection :: Error getting connection from MongoDB :: ${error}`
    );
    throw error;
  }
}
