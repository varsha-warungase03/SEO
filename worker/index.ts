
import "dotenv/config";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { Worker } from "bullmq";
import IORedis from "ioredis";
import { db } from "../src/lib/db";
import { crawlSite } from "../src/crawlers/site";
import { analyseSEO } from "../src/ai/analyse";
import { generatePdf } from "../src/reports/pdf";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("REDIS_URL is missing");
}

const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  "seo-audits",
  async (job) => {
    const { auditId, url, businessType, city, state } = job.data;

    console.log("Starting SEO audit:", auditId);

    try {
      // 1. Mark audit as processing
      await db().query(
        `UPDATE audits SET status = 'processing', progress = 5
         WHERE id = $1`,
        [auditId]
      );
      await job.updateProgress(5);

      // 2. Crawl the website
      console.log("Crawling:", url);

      const crawlData = await crawlSite(url);

      await db().query(
        `UPDATE audits SET progress = 35 WHERE id = $1`,
        [auditId]
      );
      await job.updateProgress(35);

      // 3. Prepare SEO analysis input
      const analysisInput = {
        url,
        businessType: businessType || "General Business",
        city: city || "Not provided",
        state: state || "Not provided",
        onPage: crawlData,
        technical: crawlData.technical,

        // These are clearly marked mock signals.
        pageSpeed: {
          source: "mock",
          performance: 61,
          note: "Mock PageSpeed data; not a live Google PageSpeed result."
        },
        gsc: {
          source: "mock",
          note: "Google Search Console is not connected."
        },
        rankings: {
          source: "mock",
          note: "Live keyword rankings are not connected."
        }
      };

      // 4. Analyse SEO
      console.log("Analysing SEO:", auditId);

      const analysis = await analyseSEO(analysisInput);

      await db().query(
        `UPDATE audits SET progress = 70 WHERE id = $1`,
        [auditId]
      );
      await job.updateProgress(70);

      // 5. Generate PDF
      console.log("Generating PDF:", auditId);

      const reportPath = await generatePdf(auditId, {
        url,
        ...analysis
      });

      await job.updateProgress(90);

      // 6. Save result and complete audit
      await db().query(
        `UPDATE audits
         SET status = 'completed',
             progress = 100,
             result = $2::jsonb,
             report_path = $3
         WHERE id = $1`,
        [auditId, JSON.stringify(analysis), reportPath]
      );

      await job.updateProgress(100);

      console.log("SEO audit completed:", auditId);

      return {
        auditId,
        status: "completed",
        reportPath
      };

    } catch (error: any) {
      console.error("SEO audit failed:", auditId, error);

      try {
        await db().query(
          `UPDATE audits
           SET status = 'failed'
           WHERE id = $1`,
          [auditId]
        );
      } catch (dbError) {
        console.error("Could not update failed audit:", dbError);
      }

      throw error;
    }
  },
  { connection, concurrency: 2 }
);

worker.on("ready", () => {
  console.log("SEO audit worker connected and ready");
});

worker.on("completed", (job) => {
  console.log("Audit completed:", job.id);
});

worker.on("failed", (job, error) => {
  console.error("Audit failed:", job?.id, error);
});

worker.on("error", (error) => {
  console.error("Worker error:", error);
});

console.log("SEO audit worker starting...");
