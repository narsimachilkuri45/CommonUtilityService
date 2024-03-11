import * as doSpacesUtils from "./doSpacesUtils";
import * as s3Utils from "./s3Utils";
import * as minioUtils from "./minioUtils";

const objectStorageUtils = {
  doSpaces: doSpacesUtils,
  s3: s3Utils,
  minio: minioUtils,
};

export default objectStorageUtils;
