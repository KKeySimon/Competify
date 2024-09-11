// TODO: Remove this if we decide to go with mailgun
require("dotenv").config();
import { SESClient } from "@aws-sdk/client-ses";

const REGION = process.env.AWS_SES_REGION;
const SES_CONFIG = {
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: REGION,
};
// Create SES service object.
const sesClient = new SESClient(SES_CONFIG);
export { sesClient };
