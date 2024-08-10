import type { SQSEvent } from "aws-lambda";

export const handler = async (event: SQSEvent): Promise<any> => {
  console.log(event);

  const body = event.Records[0].body;

  if (body.includes("error")) {
    throw new Error("Error found in message");
  }

  return {
    statusCode: 200,
    body: JSON.stringify("Success"),
  };
};
