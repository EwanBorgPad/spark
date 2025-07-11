import { jsonResponse, reportError } from "./cfPagesFunctionsUtils"
import { drizzle } from "drizzle-orm/d1"
import { applicationsTable } from "../../shared/drizzle-schema"
import { eq, and } from "drizzle-orm"
import { nanoid } from "nanoid"

type ENV = {
  DB: D1Database
  VITE_ENVIRONMENT_TYPE?: string
}

type CreateApplicationRequest = {
  projectId: string
  githubUsername: string
  githubId: string
  deliverableName: string
  requestedPrice: number
  estimatedDeadline: string
  featureDescription: string
  solanaWalletAddress: string
}

export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
  const db = drizzle(ctx.env.DB, { logger: true })
  try {
    const applicationData: CreateApplicationRequest = await ctx.request.json()

    // Validate required fields
    if (!applicationData.projectId || 
        !applicationData.githubUsername || 
        !applicationData.githubId ||
        !applicationData.deliverableName ||
        !applicationData.requestedPrice ||
        !applicationData.estimatedDeadline ||
        !applicationData.featureDescription ||
        !applicationData.solanaWalletAddress) {
      return jsonResponse({ message: "Missing required fields" }, 400)
    }

    // Check if user already has an application for this project
    const existingApplication = await db
      .select()
      .from(applicationsTable)
      .where(and(
        eq(applicationsTable.projectId, applicationData.projectId),
        eq(applicationsTable.githubId, applicationData.githubId)
      ))
      .get()

    if (existingApplication) {
      return jsonResponse({ message: "You already have an application for this project" }, 400)
    }

    // Create the application
    const applicationId = nanoid()
    const now = new Date().toISOString()

    await ctx.env.DB
      .prepare("INSERT INTO applications (id, project_id, github_username, github_id, deliverable_name, requested_price, estimated_deadline, feature_description, solana_wallet_address, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(
        applicationId,
        applicationData.projectId,
        applicationData.githubUsername,
        applicationData.githubId,
        applicationData.deliverableName,
        applicationData.requestedPrice,
        applicationData.estimatedDeadline,
        applicationData.featureDescription,
        applicationData.solanaWalletAddress,
        "pending",
        now,
        now
      )
      .run()

    return jsonResponse({ 
      success: true, 
      applicationId,
      message: "Application submitted successfully" 
    }, 201)
  } catch (e) {
    await reportError(ctx.env.DB, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}

export const onRequestGet: PagesFunction<ENV> = async (ctx) => {
  const db = drizzle(ctx.env.DB, { logger: true })
  try {
    const url = new URL(ctx.request.url)
    const projectId = url.searchParams.get("projectId")
    const githubId = url.searchParams.get("githubId")

    if (projectId) {
      // Get all applications for a specific project
      const applications = await db
        .select()
        .from(applicationsTable)
        .where(eq(applicationsTable.projectId, projectId))
        .all()

      return jsonResponse({ applications }, 200)
    } else if (githubId) {
      // Get all applications for a specific GitHub user
      const applications = await db
        .select()
        .from(applicationsTable)
        .where(eq(applicationsTable.githubId, githubId))
        .all()

      return jsonResponse({ applications }, 200)
    } else {
      // Get all applications (admin view)
      const applications = await db
        .select()
        .from(applicationsTable)
        .all()

      return jsonResponse({ applications }, 200)
    }
  } catch (e) {
    await reportError(ctx.env.DB, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}

export const onRequestOptions: PagesFunction<ENV> = async (ctx) => {
  try {
    if (ctx.env.VITE_ENVIRONMENT_TYPE !== "develop") return
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:5173',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    return jsonResponse({ message: error }, 500)
  }
} 