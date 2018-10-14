#!/bin/bash
set -e

DOCKER_IMAGE=crypto-feed-poller:latest
AWS_ACCOUNT_ID=$(aws sts get-caller-identity | jq -r .Account)

# Login to ecr
eval $(aws --region eu-west-1 ecr get-login)

docker build -t $DOCKER_IMAGE .

docker tag $DOCKER_IMAGE $AWS_ACCOUNT_ID.dkr.ecr.eu-west-1.amazonaws.com/$DOCKER_IMAGE

docker push $AWS_ACCOUNT_ID.dkr.ecr.eu-west-1.amazonaws.com/$DOCKER_IMAGE
