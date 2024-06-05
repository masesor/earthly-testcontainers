# Earthly Testcontainers Minimal Reproduction

This repository contains a minimal reproduction of an issue with Earthly when running test containers. The setup involves using Earthly to build a Docker image and then running tests within the Docker container.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed

## Setup

- Clone the repository:

  ```sh
  git clone https://github.com/masesor/earthly-testcontainers.git
  cd earthly-testcontainers
  ```

- Open in the DevContainer


- Install dependencies (if running test outside of Earthly):

  ```sh
  npm install
  ```

- Ensure Docker socket permissions (run inside the devcontainer if needed):

  ```sh
  sudo chmod 666 /var/run/docker.sock
  ```

## Earthly Configuration

The `Earthfile` defines the build and test process:

```dockerfile
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
```

## Running the Test

To run the test, use the following Earthly command:

```sh
earthly -P +test
```


## Issue

The test currently fails with the following error:

```
+test *failed* | Repeating the failure error...
+test *failed* | --> WITH DOCKER RUN --privileged docker run test:latest
+test *failed* | Starting dockerd with data root /var/earthly/dind/14bbf8850c33313d880e805619e795ad51590ddb9de02643645dd9681b32ade8/tmp.ODjicH
+test *failed* | Loading images from BuildKit via embedded registry...
+test *failed* | Pulling 172.30.0.1:8371/sess-pigziatq4pkiukz92xaxubxvf:img-0 and retagging as test:latest
+test *failed* | 172.30.0.1:8371/sess-pigziatq4pkiukz92xaxubxvf:img-0
+test *failed* | Untagged: 172.30.0.1:8371/sess-pigziatq4pkiukz92xaxubxvf:img-0
+test *failed* | Untagged: 172.30.0.1:xxxxx@sha256:db17a1dc6f5dd77a97e743be52af3651e4f2419f5ea6600e7782965fc2ebce06
+test *failed* | Loading images done in 13693 ms

+test *failed* | > earthly-testcontainers@0.0.0 test
+test *failed* | > node --max-old-space-size=32768 node_modules/.bin/vitest run --testTimeout=120000


+test *failed* |  RUN  v1.6.0 /app

+test *failed* | (node:18) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
+test *failed* | (Use `node --trace-deprecation ...` to show where the warning was created)
+test *failed* |  ❯ src/container.test.ts  (1 test | 1 failed) 5ms
+test *failed* |    ❯ src/container.test.ts > should work using version 6.0.1
+test *failed* |      → Could not find a working container runtime strategy

```

## Test Description

The test file is located in `src/container.test.ts` and uses Vitest along with Testcontainers for MongoDB:

```typescript
import { test } from 'vitest'
import { MongoDBContainer } from '@testcontainers/mongodb'

test("should work using version 6.0.1", async () => {
    const mongodbContainer = await new MongoDBContainer("mongo:6.0.1").start();
    await mongodbContainer.stop();
});
```

It simply starts a TestContainer which works fine if running outside of Earthly with:

```sh
docker run  --rm -v /var/run/docker.sock:/var/run/docker.sock test:latest
```
which gives:
```
> earthly-testcontainers@0.0.0 test
> node --max-old-space-size=32768 node_modules/.bin/vitest run --testTimeout=120000


 RUN  v1.6.0 /app

(node:18) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
 ✓ src/container.test.ts  (1 test) 2846ms

 Test Files  1 passed (1)
      Tests  1 passed (1)
   Start at  21:31:00
   Duration  3.10s (transform 19ms, setup 0ms, collect 80ms, tests 2.85s, environment 0ms, prepare 33ms)
```