# Cryptocurrency Rate Exchange Data Feed

This is a demo project to experiment with dynamic task scheduling on AWS ECS. Technologies used:

* [AWS ECS](https://aws.amazon.com/ecs/)
* [AWS Fargate](https://aws.amazon.com/fargate/)
* [AWS DynamoDB](https://aws.amazon.com/dynamodb/)
* [AWS Lambda](https://aws.amazon.com/lambda/)
* [serverless](https://serverless.com/)

Uses [Alpha Vantage apis](https://www.alphavantage.co/documentation/#digital-currency) to fetch live crypto currencies exchange rates.

## System overview 

*system diagram here..*

### Monitor a new cryptocurrency

* a new cryptocurrency to monitor is added as a new item in DynamoDB
* a lambda attached to the DynamoDB stream will spawn a new *crypto-feed* task on an ECS cluster
* the *crypto-feed* polls the [Alpha Vantage](https://www.alphavantage.co/documentation/#digital-currency) api and emit live currency rate exchange events for that specific cryptocurrency

### Remove a cryptocurrency

* an existing cryptocurrency item is removed from DynamoDB
* a lambda attached to the DynamoDB stream will remove the *crypto-feed* task from the ECS cluster


## Manage cryptocurrency feeds

For now you can add/remove a cryptocurrency by creating/deleting an item on the dynamodb table.

*TODO: expose this actions using http apis*

### Add a new cryptocurrency

    aws dynamodb put-item --table-name crypto-exchange-feed-dev-cryptocurrency --item '{"Symbol": {"S": "BTC"}}'

### Remove a cryptocurrency

    aws dynamodb delete-item --table-name crypto-exchange-feed-dev-cryptocurrency --key '{"Symbol": {"S": "BTC"}}'
