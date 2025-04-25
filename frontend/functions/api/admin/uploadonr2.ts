import { jsonResponse, reportError } from "../cfPagesFunctionsUtils"
import { isAdminReturnValue, checkAdminAuthorization } from "../../services/authService"
import { AdminAuthFields } from "../../../shared/models"
import { z } from "zod"

type ENV = {
  DB: D1Database
  ADMIN_ADDRESSES: string
  R2_BUCKET_NAME: string
  BUCKET: R2Bucket
  R2_PUBLIC_URL_BASE_PATH: string
}

// Create an auth schema as it's not exported from models
const authSchema = z.object({
  address: z.string(),
  message: z.string(),
  signature: z.array(z.number())
})

type UploadOnR2Request = {
  auth: AdminAuthFields
  projectId: string
  fileData: string  // Base64 encoded file data
  fileName: string
  contentType: string
  folder?: string  // Optional folder path within the project directory
}

export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
  const db = ctx.env.DB

  try {
    // Print available environment bindings for debugging
    console.log("Available environment bindings:", Object.keys(ctx.env));
    
    // Parse request
    const request = await ctx.request.json() as UploadOnR2Request
    const { auth, projectId, fileData, fileName, contentType, folder = 'nft-metadata' } = request

    console.log(`Attempting to upload file: ${fileName} to folder: ${projectId}/${folder}`);

    // Validate request
    if (!projectId || !auth || !fileData || !fileName || !contentType) {
      return jsonResponse({
        message: 'Missing required fields: projectId, auth, fileData, fileName, or contentType'
      }, 400)
    }

    // Parse and validate auth data
    const { error, data } = authSchema.safeParse(auth)
    if (error) {
      return jsonResponse({
        message: 'Invalid auth data format'
      }, 400)
    }

    // Check if user is admin using the auth service
    const authResult: isAdminReturnValue = checkAdminAuthorization({ 
      ctx, 
      auth: data as AdminAuthFields 
    })
    
    if (!authResult.isAdmin) {
      const { error: authError } = authResult as { error: { code: number; message: string }, isAdmin: false }
      await reportError(db, new Error(authError.message))
      return jsonResponse({ message: "Unauthorized! Only admins can upload files." }, authError.code)
    }

    // Decode base64 file data
    let fileBuffer: ArrayBuffer
    try {
      // Remove data URL prefix if present (e.g., "data:image/png;base64,")
      const base64Data = fileData.includes('base64,') 
        ? fileData.split('base64,')[1] 
        : fileData
        
      fileBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0)).buffer
      console.log(`Successfully decoded file data. Size: ${fileBuffer.byteLength} bytes`);
    } catch (error) {
      console.error("Error decoding base64 data:", error);
      return jsonResponse({
        message: 'Invalid base64 file data'
      }, 400)
    }

    // Prepare file path
    const filePath = `${projectId}/${folder}/${fileName}`
    console.log(`Target file path: ${filePath}`);
    
    // Check if R2 bucket is available
    if (!ctx.env.BUCKET) {
      console.warn("BUCKET binding is undefined. Available bindings:", Object.keys(ctx.env));
      
      // In development without R2, we'll fake a successful response
      // Construct public URL
      const publicUrl = new URL(ctx.env.R2_PUBLIC_URL_BASE_PATH || 'https://files.borgpad.com')
      publicUrl.pathname = filePath
      
      return jsonResponse({
        message: 'Development mode: File upload simulated successfully (BUCKET binding not available)',
        publicUrl: publicUrl.href,
        devMode: true
      })
    }
    
    // Log bucket info
    console.log("R2 bucket binding found. Attempting to upload...");
    
    try {
      // Upload file to R2 (only if bucket is available)
      await ctx.env.BUCKET.put(filePath, fileBuffer, {
        httpMetadata: {
          contentType: contentType
        }
      });
      console.log("File uploaded successfully to R2!");
    } catch (error) {
      console.error("Error during R2 put operation:", error);
      throw new Error(`R2 upload failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Construct public URL
    const publicUrl = new URL(ctx.env.R2_PUBLIC_URL_BASE_PATH || 'https://files.borgpad.com')
    publicUrl.pathname = filePath
    console.log(`File URL: ${publicUrl.href}`);

    return jsonResponse({
      message: 'File uploaded successfully',
      publicUrl: publicUrl.href
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
  } catch (e) {
    await reportError(db, e)
    console.error("Error uploading file to R2:", e)
    return jsonResponse({
      message: `Error uploading file to R2: ${e instanceof Error ? e.message : String(e)}`
    }, 500)
  }
}

// Handle OPTIONS request for CORS
export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    }
  })
} 