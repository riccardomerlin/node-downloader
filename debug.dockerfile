FROM node:8-alpine

WORKDIR /app-src

COPY . .

# add bash to alpine distribution
RUN apk add --no-cache bash

RUN npm install

CMD ["npm", "start"]
