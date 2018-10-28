FROM node:8-alpine

WORKDIR /app-src

COPY . .

# add bash to alpine distribution
RUN apk add --no-cache bash

# install nodown command globally
RUN npm install --global

CMD ["nodown"]
