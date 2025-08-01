// src/pages/api/createToken.ts
import { eq, and, ne, isNotNull, or, isNull } from "drizzle-orm"
import { jsonResponse, reportError } from "./cfPagesFunctionsUtils"
import { drizzle } from "drizzle-orm/d1"
import { tokensTable } from "../../shared/drizzle-schema"

type ENV = {
  VITE_ENVIRONMENT_TYPE: string
  DB: D1Database
}

export const onRequestGet: PagesFunction<ENV> = async (ctx) => {
  const db = drizzle(ctx.env.DB, { logger: true })
  try {
    const { searchParams } = new URL(ctx.request.url)
    const isGraduated = searchParams.get("isGraduated")

    // Validate required fields
    if (!isGraduated) {
      return jsonResponse({ message: 'Missing required fields' }, 400)
    }

    if (isGraduated === "all") {
      const tokens = await db.select().from(tokensTable);
      return jsonResponse({ tokens }, 200)
    }

    // "Graduated" tokens are now tokens that have DAOs (non-null, non-empty dao field)
    if (isGraduated === "true") {
      const tokens = await db
        .select()
        .from(tokensTable)
        .where(and(
          isNotNull(tokensTable.dao),
          ne(tokensTable.dao, "")
        ))
        .all();
      return jsonResponse({ tokens }, 200)
    }

    // "Non-graduated" tokens are tokens without DAOs (null or empty dao field)  
    if (isGraduated === "false") {
      const tokens = await db
        .select()
        .from(tokensTable)
        .where(or(
          isNull(tokensTable.dao),
          eq(tokensTable.dao, "")
        ))
        .all();
      return jsonResponse({ tokens }, 200)
    }

  } catch (e) {
    await reportError(ctx.env.DB, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
};

export const onRequestOptions: PagesFunction<ENV> = async (ctx) => {
  try {
    if (ctx.env.VITE_ENVIRONMENT_TYPE !== "develop") return
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:5173', // Adjusted this for frontend origin
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    return jsonResponse({ message: error }, 500)
  }
}

