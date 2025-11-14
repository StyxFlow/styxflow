import { createClient, type RedisClientType } from "redis";
import status from "http-status";
import config from "../config/index.js";
import { ApiError } from "../app/errors/apiError.js";

let redisClient: RedisClientType | null = null;

export const connectRedis = async () => {
  if (redisClient && (redisClient as RedisClientType).isOpen) {
    return redisClient;
  }
  try {
    const usename = config.redis.username!;
    const password = config.redis.password!;
    const host = config.redis.host!;
    const port = Number(config.redis.port);
    const client = createClient({
      password: password,
      username: usename,
      socket: {
        host: host,
        port: port,
      },
    });

    client.on("error", (err) => {
      // Suppress ECONNRESET errors during reconnection attempts
      if (err.message?.includes("ECONNRESET")) {
        console.log("Redis: Connection reset, will attempt reconnection...");
      } else {
        console.error("Redis Client Error:", err.message);
      }
    });

    client.on("connect", () => {
      console.log("Connected to Redis...");
    });

    client.on("ready", () => {
      console.log("Redis client is ready and authenticated");
    });

    client.on("end", () => {
      console.log("Redis client: Connection closed.");
      redisClient = null;
    });

    client.on("reconnecting", () => {
      console.log("Redis client: Reconnecting...");
    });

    await client.connect();

    // Test the connection
    const pingResult = await client.ping();
    console.log("Redis connection test:", pingResult);

    redisClient = client as RedisClientType;
    return redisClient;
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
    throw new ApiError(
      status.INTERNAL_SERVER_ERROR,
      `Failed to connect to Redis: ${error}`
    );
  }
};

export const getRedisClient = (): RedisClientType => {
  if (!redisClient || !redisClient.isOpen) {
    throw new Error(
      "Redis client is not initialized or not open. Call connectRedis() first."
    );
  }
  return redisClient;
};

export const disconnectRedis = async () => {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    redisClient = null;
    console.log("Redis connection closed gracefully");
  }
};
