import Redis from "ioredis";
import { env } from "@/app/init/env.js";

let client = null;
let signalHandlersSetup = false;

const connectRedis = async () => {
  if (client) return client;

  client = new Redis({
    host: env.redis.host,
    port: env.redis.port,
    password: env.redis.password,
  });
  
  await client.ping();
  console.log("Redis connected");
  
  client.on("error", (err) => console.error("Redis error:", err));

  return client;
};

const stopRedis = async () => {
  if (client) {
    await client.quit();
    console.log("Redis connection closed");
    client = null;
  }
};

const setupRedisSignalHandlers = () => {
  if (signalHandlersSetup) return;
  
  const shutdown = async (signal) => {
    console.log(`Received ${signal}, shutting down Redis gracefully...`);
    await stopRedis();
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  
  signalHandlersSetup = true;
};

setupRedisSignalHandlers();

export {
  connectRedis,
  stopRedis,
};
