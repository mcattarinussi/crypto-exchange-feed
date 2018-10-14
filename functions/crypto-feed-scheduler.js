const AWS = require('aws-sdk');

const ECS = new AWS.ECS();

module.exports.handler = async (event, context) => {
  console.log(`Received ${event.Records.length} records`);
  for (record of event.Records) {
    switch (record.eventName) {
      case 'INSERT':
        const cryptoCurrencySymbol = record.dynamodb.NewImage.Symbol.S;
        console.log(`Spawning new crypto-feed task for ${cryptoCurrencySymbol}`);
        try {
          const data = await ECS.runTask(getRunTaskParams(cryptoCurrencySymbol)).promise();
          console.log('runTask response', data);
        } catch(err) {
          console.log(err);
        }
        break;
      case 'REMOVE':
        console.log(`Removing crypto-feed task for ${record.dynamodb.OldImage.Symbol.S}`);
        break;
      case 'MODIFY':
        console.log(`MODIFY event, nothing to do for ${record.dynamodb.NewImage.Symbol.S}`);
        break;
      default:
        console.log(`Unknown event type ${record.eventName}`);
    }
  }
}

// The task will be named with the crypto currency symbol as suffix
// and will receive the crypto currency symbol as an env variable
const getRunTaskParams = cryptoCurrencySymbol => ({
  taskDefinition: process.env.CRYPTOFEED_ECS_TASK_DEFINITION,
  cluster: process.env.CRYPTOFEEDS_ECS_CLUSTER,
  count: 1,
  launchType: 'FARGATE',
  networkConfiguration: {
    awsvpcConfiguration: {
      subnets: process.env.CRYPTOFEED_TASK_SUBNETS.split(','),
      assignPublicIp: 'DISABLED',
      securityGroups: process.env.CRYPTOFEED_TASK_SEC_GROUPS.split(',')
    },
  },
  overrides: {
    containerOverrides: [
      {
        name: process.env.CRYPTOFEED_CONTAINER_NAME,
        environment: [
          {
            name: 'CRYPTO_CURRENCY_SYMBOL',
            value: cryptoCurrencySymbol
          }
        ]
      }
    ]
  }
});
