FROM alpine:3.13.2

# Create app directory
WORKDIR /app

RUN apk update
RUN apk add --update nodejs nodejs-npm

# Install app dependencies
ADD package.json /app/package.json

RUN npm install

COPY . .

EXPOSE 5000
