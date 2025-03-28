import { GetProjectsResponse, InvestmentIntentSummary, ProjectModel, projectSchema, ProjectTypeSchema } from "../../../shared/models"
import { jsonResponse, reportError } from "../cfPagesFunctionsUtils"
import { projectTable, ProjectStatus } from "../../../shared/drizzle-schema"
import { and, count, eq, like, not, sql } from "drizzle-orm"
import { drizzle, DrizzleD1Database } from "drizzle-orm/d1"
import { z } from 'zod'
import { isApiKeyValid } from '../../services/apiKeyService'
import { SaleResultsService } from "../../services/saleResultsService"
import { isDateInPast, isDateInFutureOrInvalid } from "../../../shared/utils/compareDates"


const requestSchema = z.object({
  page: z.coerce.number().int().default(1),
  limit: z.coerce.number().int().default(9),
  projectType: ProjectTypeSchema.optional(),
  completionStatus: z.enum(['completed', 'active', 'all']).default('all'),
  sortBy: z.enum(['name', 'date', 'raised', 'fdv', 'participants', 'commitments', 'sector']).optional(),
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

    return jsonResponse(projects, {
      headers: {
        "Cache-Control": "public, max-age=15"
      }
    })
  } catch (e) {
    await reportError(db, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}

type GetProjectsFromDbArgs = z.infer<typeof requestSchema>
const getProjectsFromDB = async (db: DrizzleD1Database, args: GetProjectsFromDbArgs): Promise<GetProjectsResponse | null> => {
  const { projectType, completionStatus, sortBy, sortDirection, page, limit } = args
  const offset = (page - 1) * limit

  // Base where conditions that apply to all queries
  let whereConditions = and(
    eq(projectTable.status, 'active'),
    not(like(projectTable.id, 'hidden%')),
    projectType ? sql`json -> 'info' ->> 'projectType' = ${projectType}` : undefined,
  )

  // Fetch all projects with base conditions first to avoid multiple queries
  const allProjects = await db
    .select()
    .from(projectTable)
    .where(whereConditions)
    .all();

  // This will track our total count for pagination
  let filteredProjects = allProjects;
  
  // Handle completion status filtering
  if (completionStatus !== 'all') {
    // Filter projects based on completion status
    filteredProjects = allProjects
      .filter(project => {
        const timeline = project.json?.info?.timeline || [];
        const saleClosesEvent = timeline.find((event: any) => event.id === 'SALE_CLOSES');

        if (completionStatus === 'completed') {
          // Project is completed if it has a SALE_CLOSES event with a date in the past
          return saleClosesEvent?.date &&
            typeof saleClosesEvent.date === 'string' &&
            isDateInPast(saleClosesEvent.date);
        } else {
          // Project is active if it has no SALE_CLOSES event or the date is in the future/null/empty
          return !saleClosesEvent ||
            !saleClosesEvent.date ||
            typeof saleClosesEvent.date !== 'string' ||
            isDateInFutureOrInvalid(saleClosesEvent.date);
        }
      });
    
    const filteredProjectIds = filteredProjects.map(project => project.id);

    // Update where conditions for subsequent queries
    if (filteredProjectIds.length > 0) {
      whereConditions = and(
        whereConditions,
        sql`id IN (${sql.join(filteredProjectIds, sql`, `)})`
      );
    } else {
      // If no projects match the completion criteria, return empty results
      whereConditions = and(
        whereConditions,
        sql`1 = 0` // This ensures no projects are returned
      );
    }
  }

  // Calculate pagination values directly from our filtered projects
  const total = filteredProjects.length;
  const totalPages = Math.ceil(total / limit);

  // Get project IDs for investment intent query
  const projectIds = filteredProjects.map(project => project.id);

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

  // Get deposit stats directly using the optimized methods
  let depositStats: Record<string, { totalDepositedInUsd: number, participantsCount: number }> = {};
  // Get deposit amounts and participant counts separately
  const depositAmounts = await SaleResultsService.getDepositAmount(db);
  const participantCounts = await SaleResultsService.getDepositParticipants(db);

  // Combine data for all projects
  const allProjectIds = new Set([...depositAmounts.keys(), ...participantCounts.keys()]);

  // Create a record with combined data
  Array.from(allProjectIds).forEach(projectId => {
    depositStats[projectId] = {
      totalDepositedInUsd: depositAmounts.get(projectId) || 0,
      participantsCount: participantCounts.get(projectId) || 0
    };
  });

  // Map projects to return format with investment intent summaries and deposit stats
  const projectsWithSummaries = filteredProjects.map(project => {
    const summary = investmentIntentSummaries.find(summary => summary.project_id === project.id) ||
      { project_id: project.id, sum: 0, avg: 0, count: 0 };

    // Include deposit stats directly
    const projectDepositStats = depositStats[project.id] || { 
      totalDepositedInUsd: 0, 
      participantsCount: 0 
    };

    return {
      ...project,
      investmentIntentSummary: summary,
      depositStats: projectDepositStats
    };
  });

  // Apply sorting based on the requested sort criteria
  let sortedProjects = [...projectsWithSummaries];

  if (sortBy) {
    sortedProjects.sort((a, b) => {
      const multiplier = sortDirection === 'asc' ? 1 : -1;

      switch (sortBy) {
        case 'commitments':
          // Sort by commitments (investment intentions) for drafts picks
          const commitmentsA = a.investmentIntentSummary?.sum || 0;
          const commitmentsB = b.investmentIntentSummary?.sum || 0;
          return (commitmentsA - commitmentsB) * multiplier;
        case 'raised': {
          // Sort by actual raised funds (deposits)
          const statA = depositStats[a.id] || { totalDepositedInUsd: 0 };
          const statB = depositStats[b.id] || { totalDepositedInUsd: 0 };
          return (statA.totalDepositedInUsd - statB.totalDepositedInUsd) * multiplier;
        }
        case 'participants': {
          // Sort by actual participant count (unique depositors)
          const statA = depositStats[a.id] || { participantsCount: 0 };
          const statB = depositStats[b.id] || { participantsCount: 0 };
          return (statA.participantsCount - statB.participantsCount) * multiplier;
        }
        case 'sector':
          const sectorA = a.json?.info?.sector || '';
          const sectorB = b.json?.info?.sector || '';
          return sectorA.localeCompare(sectorB) * multiplier;
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
        depositStats: project.depositStats
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
