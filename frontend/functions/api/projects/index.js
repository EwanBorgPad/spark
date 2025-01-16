import { projectSchema } from "../../../shared/models";
import { hasAdminAccess, jsonResponse, reportError, } from "../cfPagesFunctionsUtils";
import { projectTable } from "../../../shared/drizzle-schema";
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
/**
 * Get request handler - returns a list of projects
 * @param ctx
 */
export const onRequestGet = async (ctx) => {
    const db = ctx.env.DB;
    try {
        const url = new URL(ctx.request.url);
        const page = parseInt(url.searchParams.get("page") || "1");
        const limit = parseInt(url.searchParams.get("limit") || "9");
        if (page < 1 || limit < 1) {
            return new Response("Invalid pagination parameters", { status: 400 });
        }
        const offset = (page - 1) * limit;
        const projects = await getProjectsFromDB(db, page, limit, offset);
        return jsonResponse(projects, 200);
    }
    catch (e) {
        await reportError(db, e);
        return jsonResponse({ message: "Something went wrong..." }, 500);
    }
};
const getProjectsFromDB = async (db, page, limit, offset) => {
    const selectProjects = await db
        .prepare(`SELECT * FROM project LIMIT ? OFFSET ?`)
        .bind(limit, offset)
        .all();
    const selectCount = (await db
        .prepare(`SELECT COUNT(*) AS total FROM project`)
        .first());
    const total = selectCount?.total || 0;
    const totalPages = Math.ceil(total / limit);
    const projects = selectProjects.results.map((project) => JSON.parse(project.json))
        .filter(project => !(project.id || '').startsWith('hidden'));
    const response = {
        projects: projects,
        pagination: {
            page,
            limit,
            total,
            totalPages,
        },
    };
    return response;
};
/**
 * Post request handler - creates a project
 * @param ctx
 */
export const onRequestPost = async (ctx) => {
    const db = drizzle(ctx.env.DB, { logger: true });
    try {
        // authorize request
        if (!hasAdminAccess(ctx)) {
            return jsonResponse(null, 401);
        }
        // parse request
        const requestJson = await ctx.request.json();
        const { error, data } = projectSchema.safeParse(requestJson);
        const { searchParams } = new URL(ctx.request.url);
        const overwrite = searchParams.get("overwrite") === 'true';
        // validate request
        if (error) {
            return jsonResponse({ message: "Invalid request!", error }, 400);
        }
        // check if exists
        if (!overwrite) {
            const project = await db
                .select()
                .from(projectTable)
                .where(eq(projectTable.id, data.id))
                .get();
            if (project)
                return jsonResponse({ message: "Project with provided id already exists!", }, 409);
        }
        const id = data.id;
        const json = JSON.stringify(data);
        // persist in db
        if (overwrite) {
            await db.run(sql `REPLACE INTO project (id, json) VALUES (${id}, ${json})`);
        }
        else {
            await db.run(sql `INSERT INTO project (id, json) VALUES (${id}, ${json})`);
        }
        const retval = {
            message: overwrite ? 'Updated!' : 'Created!'
        };
        return jsonResponse(retval, 201);
    }
    catch (e) {
        await reportError(db, e);
        return jsonResponse({ message: "Something went wrong..." }, 500);
    }
};
