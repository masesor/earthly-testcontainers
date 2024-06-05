VERSION 0.8

build:
    FROM node:22.2.0-bookworm
    WORKDIR /app
    COPY . .
    RUN npm install
    ENTRYPOINT ["npm", "test"]
    SAVE IMAGE test:latest

test:
    FROM earthly/dind:alpine-3.19-docker-25.0.5-r0
    WITH DOCKER --load test:latest=+build
        RUN docker run test:latest
    END