# Match with my local Node Version
FROM node:18.17.0-alpine

# RUN mkdir -p /app
WORKDIR /app

# My . Dir -> /app Directory
ADD . /app/

# Dependency Install
RUN yarn install

# Build
RUN yarn build

# PORT (3000) Expose
EXPOSE 3000

# START
ENTRYPOINT yarn run start:prod