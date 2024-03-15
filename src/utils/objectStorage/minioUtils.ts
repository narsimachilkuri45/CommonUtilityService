import { Client } from "minio";
import { loggerUtils } from "../logger/loggerUtils";
import {
  getBooleanEnvVariableOrDefault,
  getNumberEnvVariableOrDefault,
  getStringEnvVariableOrDefault,
} from "../config/envUtils";

const minioClient = new Client({
  endPoint: getStringEnvVariableOrDefault("COMMON_MINIO_ENDPOINT", ""),
  port: getNumberEnvVariableOrDefault("COMMON_MINIO_PORT", 9000),
  useSSL: getBooleanEnvVariableOrDefault("COMMON_MINIO_ENABLE_SSL", false),
  accessKey: getStringEnvVariableOrDefault("COMMON_MINIO_ACCESS_KEY", ""),
  secretKey: getStringEnvVariableOrDefault("COMMON_MINIO_SECRET_KEY", ""),
});

export async function listBucket(): Promise<any> {
  try {
    const buckets = await minioClient.listBuckets();
    loggerUtils.info(
      "minioUtils :: listBucket :: Retrieved buckets successfully"
    );
    return buckets;
  } catch (error) {
    loggerUtils.error(
      "minioUtils :: listBucket :: Error retrieving buckets:",
      error
    );
    throw error;
  }
}

export async function makeBucket(bucketName: string): Promise<any> {
  try {
    await minioClient.makeBucket(bucketName);
    loggerUtils.info(
      `minioUtils :: makeBucket :: Created bucket "${bucketName}" successfully`
    );
  } catch (error) {
    loggerUtils.error(
      `minioUtils :: makeBucket :: Error creating bucket "${bucketName}":`,
      error
    );
    throw error;
  }
}

export async function getObject(
  bucketName: string,
  objectName: string
): Promise<any> {
  try {
    const chunks: Buffer[] = [];
    await new Promise((resolve, reject) => {
      minioClient.getObject(bucketName, objectName, (err: any, stream: any) => {
        if (err) {
          reject(err);
          return;
        }
        stream.on("data", (chunk: any) => chunks.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
        stream.on("error", (err: any) => reject(err));
      });
    });
    loggerUtils.info(
      `minioUtils :: getObject :: Retrieved object "${objectName}" from bucket "${bucketName}" successfully`
    );
    return Buffer.concat(chunks);
  } catch (error) {
    loggerUtils.error(
      `minioUtils :: getObject :: Error retrieving object "${objectName}" from bucket "${bucketName}":`,
      error
    );
    throw error;
  }
}

export async function putObject(
  bucketName: string,
  objectName: string,
  data: any
): Promise<any> {
  try {
    await minioClient.putObject(bucketName, objectName, data);
    loggerUtils.info(
      `minioUtils :: putObject :: Successfully put object "${objectName}" to bucket "${bucketName}"`
    );
  } catch (error) {
    loggerUtils.error(
      `minioUtils :: putObject :: Error putting object "${objectName}" to bucket "${bucketName}":`,
      error
    );
    throw error;
  }
}

export async function presignedGetObject(
  bucketName: string,
  objectName: string,
  expiry: number = 3600
): Promise<string> {
  try {
    return await minioClient.presignedGetObject(bucketName, objectName, expiry);
  } catch (error) {
    loggerUtils.error(
      `minioUtils :: presignedGetObject :: Error generating presigned URL for object "${objectName}" from bucket "${bucketName}":`,
      error
    );
    throw error;
  }
}
