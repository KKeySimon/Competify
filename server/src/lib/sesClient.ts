require("dotenv").config();
import { SESClient } from "@aws-sdk/client-ses";

const REGION = process.env.AWS_SES_REGION;
// Create SES service object.
const sesClient = new SESClient({ region: REGION });
export { sesClient };
