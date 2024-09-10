import { SendEmailCommand } from "@aws-sdk/client-ses";
import { sesClient } from "../lib/sesClient";
require("dotenv").config();

const createSendEmailCommand = (toAddress, fromAddress) => {
  return new SendEmailCommand({
    Destination: {
      /* required */
      CcAddresses: [],
      ToAddresses: [toAddress],
    },
    Message: {
      Body: {
        /* required */
        Html: {
          Charset: "UTF-8",
          Data: "<h1>This is the HTML body<h1>",
        },
        Text: {
          Charset: "UTF-8",
          Data: "This is the text body",
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Hello",
      },
    },
    Source: fromAddress,
    ReplyToAddresses: [],
  });
};

const run = async () => {
  const sendEmailCommand = createSendEmailCommand(
    "competifythings@gmail.com",
    "competifythings@gmail.com"
  );

  try {
    const log = await sesClient.send(sendEmailCommand);
    console.log(log);
    return log;
  } catch (caught) {
    if (caught instanceof Error && caught.name === "MessageRejected") {
      /** @type { import('@aws-sdk/client-ses').MessageRejected} */
      const messageRejectedError = caught;
      return messageRejectedError;
    }
    throw caught;
  }
};
run();
