-- AlterTable
ALTER TABLE "users" ALTER COLUMN "profile_picture_url" SET DEFAULT 'https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/profile_pictures/profile_default.jpg';
