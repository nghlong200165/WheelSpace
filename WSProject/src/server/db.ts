import "server-only";
import mongoose from "mongoose";
import { env } from "./env";

// Reuse one connection across hot reloads in dev and across invocations on serverless.
const globalForMongoose = globalThis as unknown as {
  mongooseConn?: Promise<typeof mongoose>;
};

export function connectDb(): Promise<typeof mongoose> {
  if (!globalForMongoose.mongooseConn) {
    globalForMongoose.mongooseConn = mongoose
      .connect(env().MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
      .catch((err) => {
        // Allow the next call to retry instead of caching a failed promise.
        globalForMongoose.mongooseConn = undefined;
        throw err;
      });
  }
  return globalForMongoose.mongooseConn;
}
