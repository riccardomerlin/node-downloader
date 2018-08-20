FROM node:8

WORKDIR /app-src

COPY . .

RUN npm install -g

CMD ["nodown"]
