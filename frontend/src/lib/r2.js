import { S3, PutObjectAclCommand, S3Client } from "@aws-sdk/client-s3";
const s2 = new S3Client({
  region: "auto",
  endpoint: process.env.endpoint,
});
