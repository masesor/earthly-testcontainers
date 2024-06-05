import { test } from 'vitest'
import {
    MongoDBContainer,
} from '@testcontainers/mongodb'

/**
 * What is the best way to run this in Earthly?
 */
test("should work using version 6.0.1", async () => {
    const mongodbContainer = await new MongoDBContainer("mongo:6.0.1").start();
    await mongodbContainer.stop();
});
