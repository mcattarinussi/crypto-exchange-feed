module.exports.handler = async (event, context) => {
  console.log(`Received ${event.Records.length} records`);
  for(record of event.Records) {
    switch(record.eventName) {
      case 'INSERT':
        console.log(`Spawning new crypto-feed task for ${record.dynamodb.NewImage.Symbol.S}`);
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
