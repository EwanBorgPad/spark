import { analysisTable } from '../../../shared/drizzle-schema'
import { jsonResponse, reportError } from "../cfPagesFunctionsUtils"
import { drizzle, DrizzleD1Database } from "drizzle-orm/d1"
import { eq } from "drizzle-orm"
import { TweetScoutTweetResponse } from '../../../shared/types/api-types'
import { isApiKeyValid } from '../../services/apiKeyService'

type ENV = {
  DB: D1Database
  TWEET_SCOUT_API_KEY: string
}
type AnalysisTableColumns = typeof analysisTable.$inferSelect;

type FetchResult = {
  impressions: number;
  likes: number;
  analysisId: string
}

export const onRequestGet: PagesFunction<ENV> = async (ctx) => {
  const db = drizzle(ctx.env.DB, { logger: true })
  try {
    console.log("Refreshing X stats for articles initiated.");
    // authorize request
    if (!await isApiKeyValid({ ctx, permissions: ['write'] })) {
      return jsonResponse(null, 401)
    }
    try {
      const tweetScoutApiKey = ctx.env.TWEET_SCOUT_API_KEY
      if (!tweetScoutApiKey) throw new Error("Missing api key for Tweet Scout!")

      const allAnalyses = await db.select().from(analysisTable).where(eq(analysisTable.isApproved, true))

      // Fetch a single tweet's metrics from Tweet Scout API.
      const fetchTweetMetrics = async (analysis: typeof allAnalyses[number]): Promise<FetchResult> => {
        console.log(`Fetching metrics for articleUrl: ${analysis.articleUrl}`);

        const body = JSON.stringify({ tweet_link: analysis.articleUrl });

        try {
          const response = await fetch("https://api.tweetscout.io/v2/tweet-info", {
            method: "POST",
            headers: {
              Accept: "application/json",
              ApiKey: tweetScoutApiKey,
              "Content-Type": "application/json",
            },
            body,
          });

          console.log(`Received response for: ${analysis.articleUrl} with status: ${response.status}`);

          if (!response.ok) {
            console.log(`Error fetching metrics for ${analysis.articleUrl}: ${response.statusText}`);
            throw new Error(`Failed to fetch tweet metrics for ${analysis.articleUrl}`);
          }

          const data = (await response.json()) as TweetScoutTweetResponse;

          return {
            impressions: data.view_count,
            likes: data.favorite_count,
            analysisId: analysis.id
          };
        } catch (error) {
          console.error(`Error processing ${analysis.articleUrl}:`, error);
          return { impressions: 0, likes: 0, analysisId: analysis.id }; // Return default values if an error occurs
        }
      };

      // Main function that fetches data in batches
      const fetchMetricsInBatches = async (): Promise<FetchResult[]> => {
        console.log("Fetching all article stats from Tweet Scout...");

        const allAnalyses = await db.select().from(analysisTable).all();
        console.log(`Total articles to process: ${allAnalyses.length}`);

        const batchSize = 20; // Maximum requests per second
        const delayBetweenBatches = 1000; // 1 second delay between batches
        let results: FetchResult[] = [];

        for (let i = 0; i < allAnalyses.length; i += batchSize) {
          const batch = allAnalyses.slice(i, i + batchSize);
          console.log(`Processing batch ${i / batchSize + 1}/${Math.ceil(allAnalyses.length / batchSize)} with ${batch.length} requests...`);

          try {
            const batchResults = await Promise.all(batch.map(fetchTweetMetrics));
            console.log(`Batch ${i / batchSize + 1} completed. Merging results...`);
            results = results.concat(batchResults);
          } catch (batchError) {
            console.error(`Error in batch ${i / batchSize + 1}:`, batchError);
          }

          if (i + batchSize < allAnalyses.length) {
            console.log(`Waiting ${delayBetweenBatches / 1000} seconds before next batch...`);
            await new Promise((resolve) => setTimeout(resolve, delayBetweenBatches));
          }
        }

        console.log("All batches completed. Final results:", results);
        if (!results.length) return []
        return results;
      };
      const results: FetchResult[]  = await fetchMetricsInBatches()
      if (!results) throw new Error ('no results')

      await updateRowsInBatch({updates: results, db})

      console.log("🚀 ~ refreshImpressionsAndLikes ~ results:", results)
      return jsonResponse(null, 200)
    } catch (e) {
      return jsonResponse({
        message: 'Something went wrong...',
        error: e.message,
      }, 500)
    }
    
  } catch (e) {
    await reportError(db, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}

type UpdateRowsInBatchArgs = {
  updates: FetchResult[],
  db: DrizzleD1Database
}

const updateRowsInBatch = async ({ updates, db }: UpdateRowsInBatchArgs) => {
  const batchSize = 19;
  const chunks: FetchResult[][] = [];
  console.log(`updating 'analysis' table in chunks...`);
  for (let i = 0; i < updates.length; i += batchSize) {
    chunks.push(updates.slice(i, i + batchSize));
  }

  for (const chunk of chunks) {
    if (chunk.length === 0) continue; // Skip empty chunks

    const statements = chunk.map(row => {
      const setValues: Partial<AnalysisTableColumns> = {
        impressions: row.impressions,
        likes: row.likes,
      };

      return db.update(analysisTable)
        .set(setValues)
        .where(eq(analysisTable.id, row.analysisId))
    });

    await db.batch(statements as any);
  }
  console.log('update complete');
};