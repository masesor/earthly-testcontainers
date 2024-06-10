VERSION 0.8

build:
    FROM node:22.2.0-bookworm
    WORKDIR /app
    ENV DEBUG=testcontainers*
    COPY . .
    RUN npm install
    ENTRYPOINT ["npm", "test"]
    SAVE IMAGE test:latest

test:
    FROM earthly/dind:alpine-3.19-docker-25.0.5-r0
    WITH DOCKER --load test:latest=+build
        RUN docker run -v /var/run/docker.sock:/var/run/docker.sock test:latest
    END