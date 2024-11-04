import {
  S3Client,
  PutObjectCommand,
  ObjectCannedACL,
} from "@aws-sdk/client-s3";

export const uploadProfilePicture = async (
  file: Buffer,
  bucketName: string,
  userId: number
) => {
  try {
    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const key = `profile_pictures/profile_${userId}.jpg`;

    const params = {
      Bucket: bucketName,
      Key: key,
      Body: file,
      ContentType: "image/jpeg",
    };

    const command = new PutObjectCommand(params);

    const data = await s3.send(command);

    return key;
  } catch (e) {
    console.error("Error uploading file:", e);
    throw e;
  }
};
