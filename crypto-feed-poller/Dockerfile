FROM node:10-alpine

COPY index.js .
COPY package.json .
COPY package-lock.json .

RUN npm install

ENTRYPOINT [ "npm", "run", "start-poller" ]
