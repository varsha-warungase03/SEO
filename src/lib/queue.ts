import { Queue } from "bullmq";
import IORedis from "ioredis";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("REDIS_URL is missing");
}

const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
});

export const auditQueue = new Queue("seo-audits", {
  connection,
});