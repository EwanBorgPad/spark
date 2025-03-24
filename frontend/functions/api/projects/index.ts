import { GetProjectsResponse, InvestmentIntentSummary, ProjectModel, projectSchema, ProjectTypeSchema } from "../../../shared/models"
import { jsonResponse, reportError } from "../cfPagesFunctionsUtils"
import { projectTable, ProjectStatus } from "../../../shared/drizzle-schema"
import { and, count, eq, like, not, sql } from "drizzle-orm"
import { drizzle, DrizzleD1Database } from "drizzle-orm/d1"
import { z } from 'zod'
import { isApiKeyValid } from '../../services/apiKeyService'
import { SaleResultsService } from "../../services/saleResultsService"


const requestSchema = z.object({
  page: z.coerce.number().int().default(1),
  limit: z.coerce.number().int().default(9),
  projectType: ProjectTypeSchema.optional(),
  completionStatus: z.enum(['completed', 'active', 'all']).default('all'),
  sortBy: z.enum(['name', 'date', 'raised', 'fdv', 'participants', 'commitments']).optional(),
  sortDirection: z.enum(['asc', 'desc']).default('desc'),
})

type ENV = {
  DB: D1Database
  R2: R2Bucket
}
/**
 * Get request handler - returns a list of projects
 * @param ctx
 */
export const onRequestGet: PagesFunction<ENV> = async (ctx) => {
  const db = drizzle(ctx.env.DB, { logger: true })
  try {
    const requestDataObject = Object.fromEntries(new URL(ctx.request.url).searchParams)

    const { data: requestData, error } = requestSchema.safeParse(requestDataObject)

    if (!requestData || error) 
      return jsonResponse({ message: 'Bad request!', error }, 400)

    const projects = await getProjectsFromDB(db, requestData)

    return jsonResponse(projects, 200)
  } catch (e) {
    await reportError(db, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}

type GetProjectsFromDbArgs = z.infer<typeof requestSchema>
const getProjectsFromDB = async (db: DrizzleD1Database, args: GetProjectsFromDbArgs): Promise<GetProjectsResponse | null> => {
  const { projectType, completionStatus, sortBy, sortDirection, page, limit } = args
  const offset = (page - 1) * limit

  let whereConditions = and(
    eq(projectTable.status, 'active'),
    not(like(projectTable.id, 'hidden%')),
    projectType ? sql`json -> 'info' ->> 'projectType' = ${projectType}` : undefined,
  )

  switch (sortBy) {
    case 'name':
      whereConditions = and(
        whereConditions,
        sql`json_extract(json, '$.info.title') IS NOT NULL`
      )
      break
    case 'date':
      whereConditions = and(
        whereConditions,
        sql`json_extract(json, '$.info.timeline') IS NOT NULL`
      )
      break
    case 'fdv':
      whereConditions = and(
        whereConditions,
        sql`json_extract(json, '$.config.fdv') IS NOT NULL`
      )
      break
  }
  
  if (completionStatus !== 'all') {
    // Get current date in ISO format, ensuring we compare strings in a way SQLite will understand
    const now = new Date().toISOString();
    
    if (completionStatus === 'completed') {
      // A project is completed if its SALE_CLOSES date is in the past
      // Modified to use direct JSON path syntax instead of json_each
      whereConditions = and(
        whereConditions,
        // First ensure that the project has a timeline
        sql`json_extract(json, '$.info.timeline') IS NOT NULL`,
        // Find events where SALE_CLOSES has a date in the past - add extra parentheses to maintain proper grouping
        sql`((
          json_extract(json, '$.info.timeline[0].id') = 'SALE_CLOSES' AND 
          json_extract(json, '$.info.timeline[0].date') IS NOT NULL AND 
          json_extract(json, '$.info.timeline[0].date') != "" AND 
          json_extract(json, '$.info.timeline[0].date') < ${now}
        ) OR (
          json_extract(json, '$.info.timeline[1].id') = 'SALE_CLOSES' AND 
          json_extract(json, '$.info.timeline[1].date') IS NOT NULL AND 
          json_extract(json, '$.info.timeline[1].date') != "" AND 
          json_extract(json, '$.info.timeline[1].date') < ${now}
        ) OR (
          json_extract(json, '$.info.timeline[2].id') = 'SALE_CLOSES' AND 
          json_extract(json, '$.info.timeline[2].date') IS NOT NULL AND 
          json_extract(json, '$.info.timeline[2].date') != "" AND 
          json_extract(json, '$.info.timeline[2].date') < ${now}
        ) OR (
          json_extract(json, '$.info.timeline[3].id') = 'SALE_CLOSES' AND 
          json_extract(json, '$.info.timeline[3].date') IS NOT NULL AND 
          json_extract(json, '$.info.timeline[3].date') != "" AND 
          json_extract(json, '$.info.timeline[3].date') < ${now}
        ) OR (
          json_extract(json, '$.info.timeline[4].id') = 'SALE_CLOSES' AND 
          json_extract(json, '$.info.timeline[4].date') IS NOT NULL AND 
          json_extract(json, '$.info.timeline[4].date') != "" AND 
          json_extract(json, '$.info.timeline[4].date') < ${now}
        ))`
      )
    } else if (completionStatus === 'active') {
      // A project is active if:
      // 1. It has no SALE_CLOSES event, OR
      // 2. SALE_CLOSES has a NULL date, OR 
      // 3. SALE_CLOSES has an empty string date, OR
      // 4. SALE_CLOSES has a future date
      
      // Modified to use direct JSON path syntax instead of json_each
      whereConditions = and(
        whereConditions,
        // First ensure that the project has a timeline
        sql`json_extract(json, '$.info.timeline') IS NOT NULL`,
        // Check all possible positions for SALE_CLOSES in the array
        sql`((
          (
            json_extract(json, '$.info.timeline[0].id') = 'SALE_CLOSES' AND (
              json_extract(json, '$.info.timeline[0].date') IS NULL OR
              json_extract(json, '$.info.timeline[0].date') = "" OR
              json_extract(json, '$.info.timeline[0].date') = 'null' OR
              json_extract(json, '$.info.timeline[0].date') > ${now}
            )
          ) OR (
            json_extract(json, '$.info.timeline[1].id') = 'SALE_CLOSES' AND (
              json_extract(json, '$.info.timeline[1].date') IS NULL OR
              json_extract(json, '$.info.timeline[1].date') = "" OR
              json_extract(json, '$.info.timeline[1].date') = 'null' OR
              json_extract(json, '$.info.timeline[1].date') > ${now}
            )
          ) OR (
            json_extract(json, '$.info.timeline[2].id') = 'SALE_CLOSES' AND (
              json_extract(json, '$.info.timeline[2].date') IS NULL OR
              json_extract(json, '$.info.timeline[2].date') = "" OR
              json_extract(json, '$.info.timeline[2].date') = 'null' OR
              json_extract(json, '$.info.timeline[2].date') > ${now}
            )
          ) OR (
            json_extract(json, '$.info.timeline[3].id') = 'SALE_CLOSES' AND (
              json_extract(json, '$.info.timeline[3].date') IS NULL OR
              json_extract(json, '$.info.timeline[3].date') = "" OR
              json_extract(json, '$.info.timeline[3].date') = 'null' OR
              json_extract(json, '$.info.timeline[3].date') > ${now}
            )
          ) OR (
            json_extract(json, '$.info.timeline[4].id') = 'SALE_CLOSES' AND (
              json_extract(json, '$.info.timeline[4].date') IS NULL OR
              json_extract(json, '$.info.timeline[4].date') = "" OR
              json_extract(json, '$.info.timeline[4].date') = 'null' OR
              json_extract(json, '$.info.timeline[4].date') > ${now}
            )
          ) OR (
            json_extract(json, '$.info.timeline[0].id') != 'SALE_CLOSES' AND
            json_extract(json, '$.info.timeline[1].id') != 'SALE_CLOSES' AND
            json_extract(json, '$.info.timeline[2].id') != 'SALE_CLOSES' AND
            json_extract(json, '$.info.timeline[3].id') != 'SALE_CLOSES' AND
            json_extract(json, '$.info.timeline[4].id') != 'SALE_CLOSES'
          )
        ))`
      )
    }
  }
  
  const countQuery = db
    .select({ count: count() })
    .from(projectTable)
    .where(whereConditions)
  const countResult = (await countQuery.get()).count
  const total = countResult || 0
  const totalPages = Math.ceil(total / limit)

  // Get all projects first so we can get the investment intent summaries
  const projectsResult = await db
    .select()
    .from(projectTable)
    .where(whereConditions)
    .all()
  
  // Get project IDs for investment intent query
  const projectIds = projectsResult.map(project => project.id)
  
  // Get investment intent summaries for all projects
  const investmentIntentSummaries = await db.all(
    sql`
      SELECT
        json_each.key AS project_id,
        SUM(json_each.value ->> 'amount') AS sum,
        AVG(json_each.value ->> 'amount') AS avg,
        COUNT(json_each.value ->> 'amount') AS count
      FROM user, 
      json_each(user.json, '$.investmentIntent') 
      WHERE json_each.key IN (${sql.join(projectIds, sql`, `)})
      GROUP BY json_each.key;
    `
  ) as { project_id: string, sum: number, avg: number, count: number }[];
  
  // Get sale results for all projects using SaleResultsService
  const saleResultsPromises = projectIds.map(async (projectId) => {
    try {
      const saleResults = await SaleResultsService.getSaleResults({ db, projectId });
      return { projectId, saleResults };
    } catch (error) {
      console.error(`Error fetching sale results for ${projectId}:`, error);
      return { projectId, saleResults: null };
    }
  });
  
  const saleResultsArray = await Promise.all(saleResultsPromises);
  const saleResultsMap = saleResultsArray.reduce((acc, { projectId, saleResults }) => {
    if (saleResults) {
      acc[projectId] = saleResults;
    }
    return acc;
  }, {} as Record<string, any>);

  // Map projects to return format with investment intent summaries and sale results
  const projectsWithSummaries = projectsResult.map(project => {
    const summary = investmentIntentSummaries.find(summary => summary.project_id === project.id) || 
      { project_id: project.id, sum: 0, avg: 0, count: 0 };
      
    const saleResults = saleResultsMap[project.id] || null;
    
    return {
      ...project,
      investmentIntentSummary: summary,
      saleResults
    };
  });

  // Apply sorting based on the requested sort criteria
  let sortedProjects = [...projectsWithSummaries];
  
  if (sortBy) {
    sortedProjects.sort((a, b) => {
      const multiplier = sortDirection === 'asc' ? 1 : -1;
      
      switch (sortBy) {
        case 'commitments':
          // Sort by commitments respecting sortDirection
          const sumA = a.investmentIntentSummary?.sum || 0;
          const sumB = b.investmentIntentSummary?.sum || 0;
          return (sumA - sumB) * multiplier;
        case 'raised':
          // Sort by raised respecting sortDirection
          const raisedA = a.investmentIntentSummary?.sum || 0;
          const raisedB = b.investmentIntentSummary?.sum || 0;
          return (raisedA - raisedB) * multiplier;
        case 'participants':
          // Sort by participants respecting sortDirection
          const countA = a.investmentIntentSummary?.count || 0;
          const countB = b.investmentIntentSummary?.count || 0;
          return (countA - countB) * multiplier;
        case 'name':
          // Handle possibly missing title
          const titleA = a.json?.info?.title || '';
          const titleB = b.json?.info?.title || '';
          return titleA.localeCompare(titleB) * multiplier;
        case 'date': {
          // Handle possibly missing timeline data
          const aTimeline = a.json?.info?.timeline || [];
          const bTimeline = b.json?.info?.timeline || [];
          const aEvent = aTimeline.find((t: any) => t.id === 'SALE_CLOSES');
          const bEvent = bTimeline.find((t: any) => t.id === 'SALE_CLOSES');
          
          // If date is null, treat it specially in sorting
          // For ascending: null dates go at the end (considered "larger")
          // For descending: null dates go at the beginning (considered "larger")
          if (aEvent?.date === null && bEvent?.date === null) return 0;
          if (aEvent?.date === null) return sortDirection === 'asc' ? 1 : -1;
          if (bEvent?.date === null) return sortDirection === 'asc' ? -1 : 1;
          
          const aDate = aEvent?.date ? new Date(aEvent.date).getTime() : 0;
          const bDate = bEvent?.date ? new Date(bEvent.date).getTime() : 0;
          return (bDate - aDate) * multiplier; 
        }
        case 'fdv':
          const fdvA = a.json?.config?.fdv || 0;
          const fdvB = b.json?.config?.fdv || 0;
          return (fdvA - fdvB) * multiplier;
        default:
          return 0;
      }
    });
  }
  
  // Apply pagination after sorting
  const paginatedProjects = sortedProjects.slice(offset, offset + limit);
  
  // Map to final return format
  const retvalProjects = 
    paginatedProjects.map(project => {
      // Create a default investment summary if none exists
      const investmentSummary = project.investmentIntentSummary || {
        project_id: project.id,
        sum: 0,
        avg: 0,
        count: 0
      };
      
      return {
        ...project.json,
        investmentIntentSummary: investmentSummary,
        saleResults: project.saleResults,
      };
    });

  const response = {
    projects: retvalProjects,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  }

  return response
}

////////////////////////////////////////////////
////////////// CREATE PROJECT API //////////////
////////////////////////////////////////////////

/**
 * Post request handler - creates a project
 * @param ctx
 */
export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
  const db = drizzle(ctx.env.DB, { logger: true })
  try {
    // authorize request
    if (!await isApiKeyValid({ ctx, permissions: ['write'] })) {
      return jsonResponse(null, 401)
    }

    // parse request
    const requestJson = await ctx.request.json()
    const { error, data } = projectSchema.safeParse(requestJson)

    const { searchParams } = new URL(ctx.request.url)
    const overwrite = searchParams.get("overwrite") === 'true'

    // validate request
    if (error) {
      return jsonResponse({ message: "Invalid request!", error }, 400)
    }

    // check if exists
    const project = await db
      .select()
      .from(projectTable)
      .where(eq(projectTable.id, data.id))
      .get()
    
    const projectExists = Boolean(project)
    if (!overwrite && projectExists) return jsonResponse({ message: "Project with provided id already exists!", }, 409)

    const id = data.id
    const json = JSON.stringify(data)
    const now = new Date().toISOString()
    // projects created/updated through this API are always 'active'
    const newStatus: ProjectStatus = 'active'
    // persist in db
    if (projectExists) {
      await db.run(sql`UPDATE project SET status = ${newStatus}, updated_at = ${now}, json = ${json} WHERE id = ${id};`)
    } else {
      await db.run(sql`INSERT INTO project (id, status, created_at, updated_at, json) VALUES (${id}, ${newStatus}, ${now}, ${now}, ${json})`)
    }

    // nft metadata update
    let nftMetadataUploaded = false
    const nftConfig = data.config.nftConfig
    if (nftConfig) {
      const nftMetadata = {
        "name": nftConfig.name,
        "symbol": nftConfig.symbol,
        "description": nftConfig.description,
        "image": nftConfig.imageUrl,
      }
      const metadataKey = `${id}/nft-metadata/metadata.json`
      await ctx.env.R2.put(metadataKey, JSON.stringify(nftMetadata, null, 2))
      nftMetadataUploaded = true
    }

    const retval = {
      message: projectExists ? 'Updated!' : 'Created!',
      nftMetadataUploaded,
    }

    return jsonResponse(retval, 201)
  } catch (e) {
    await reportError(db, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}
