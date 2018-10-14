const AWS = require('aws-sdk');

const ECS = new AWS.ECS();

module.exports.handler = async (event, context) => {
  console.log(`Received ${event.Records.length} records`);
  for (record of event.Records) {
    switch (record.eventName) {

      case 'INSERT':
        const cryptoCurrencySymbolNew = record.dynamodb.NewImage.Symbol.S;
        console.log(`Spawning new crypto-feed task for ${cryptoCurrencySymbolNew}`);
        try {
          const { tasks } = await ECS.runTask(buildRunTaskParams(cryptoCurrencySymbolNew)).promise();
          console.log(`New task launched for ${cryptoCurrencySymbolNew}. TaskArn:`, tasks[0].taskArn);
        } catch (err) {
          console.log(err);
        }
        break;

      case 'REMOVE':
        const cryptoCurrencySymbolOld = record.dynamodb.OldImage.Symbol.S;
        console.log(`Removing crypto-feed task for ${cryptoCurrencySymbolOld}`);
        try {
          // TODO: handle null response
          const { taskArn } = await getRunningTask(cryptoCurrencySymbolOld);
          await ECS.stopTask({
            cluster: process.env.CRYPTOFEEDS_ECS_CLUSTER,
            task: taskArn,
            reason: 'CRYPTOCURRENCY_REMOVED'
          }).promise();
          console.log(`Successfully removed task for ${cryptoCurrencySymbolOld}. Was taskArn ${taskArn}`);
        } catch (err) {
          console.log(err);
        }
        break;

      case 'MODIFY':
        console.log(`MODIFY event, nothing to do for ${record.dynamodb.NewImage.Symbol.S}`);
        break;

      default:
        console.log(`Unknown event type ${record.eventName}`);
    }
  }
}

// The task will receive the crypto currency symbol as an env variable
const buildRunTaskParams = cryptoCurrencySymbol => ({
  taskDefinition: process.env.CRYPTOFEED_ECS_TASK_DEFINITION,
  cluster: process.env.CRYPTOFEEDS_ECS_CLUSTER,
  count: 1,
  launchType: 'FARGATE',
  group: `crypto-feed-${cryptoCurrencySymbol}`,
  startedBy: 'crypto-feed-scheduler',
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

// Returns the running task object for the provided cryptoCurrencySymbol
// or null if no matching task is found
const getRunningTask = async cryptoCurrencySymbol => {
  const { taskArns } = await ECS.listTasks({ cluster: process.env.CRYPTOFEEDS_ECS_CLUSTER }).promise();
  const { tasks } = await ECS.describeTasks({
    cluster: process.env.CRYPTOFEEDS_ECS_CLUSTER,
    tasks: taskArns
  }).promise();
  return tasks.find(t => t.group === `crypto-feed-${cryptoCurrencySymbol}`) || null;
};
