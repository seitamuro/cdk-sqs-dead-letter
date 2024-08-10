import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";

export class CdkSqsDeadLetterStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const deadLetterQueue = new sqs.Queue(this, "DeadLetterQueue", {
      queueName: "DeadLetterQueue",
      retentionPeriod: cdk.Duration.days(14),
    });

    const mainQueue = new sqs.Queue(this, "MainQueue", {
      queueName: "MainQueue",
      deadLetterQueue: {
        maxReceiveCount: 3,
        queue: deadLetterQueue,
      },
      visibilityTimeout: cdk.Duration.seconds(30),
    });

    const consumerLambda = new NodejsFunction(this, "ConsumerLambda", {
      entry: "lambda/consumer.ts",
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_20_X,
    });
    mainQueue.grantConsumeMessages(consumerLambda);
    consumerLambda.addEventSource(new SqsEventSource(mainQueue));
  }
}
