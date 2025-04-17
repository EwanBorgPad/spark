import { ReferralCodeRequestSchema } from "../../shared/models";
import { jsonResponse, reportError } from "./cfPagesFunctionsUtils";
import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import { decodeUTF8 } from "tweetnacl-util";
import { UserService } from "../services/userService"
import { validateTransaction } from "../../shared/solana/validateTransaction"
import { v4 as uuidv4 } from 'uuid';
import { getReferralCode, getAddressByReferralCode } from "../services/referralService";

type ENV = {
  DB: D1Database
}

// Add this handler for OPTIONS requests
export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "http://localhost:5173",
      "Access-Control-Allow-Methods": "OPTIONS, GET, PUT, POST, DELETE, HEAD",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  })
}

export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
  const db = ctx.env.DB
  try {
    const requestJson = await ctx.request.json()
    const { error, data } = ReferralCodeRequestSchema.safeParse(requestJson)

    if (error) {
      return jsonResponse(null, 400)
    }

    ///// authorization
    const { publicKey, message, signature, isLedgerTransaction, projectId, referrerTwitterHandle } = data

    let isVerified = false

    if (isLedgerTransaction) {
      try {
        isVerified = await validateTransaction(message, publicKey, new Uint8Array(signature))
      } catch (err) {
        console.error("❌ Error during transaction verification:", err)
        return jsonResponse(null, 500)
      }
    } else {
      isVerified = nacl.sign.detached.verify(
        decodeUTF8(message),
        new Uint8Array(signature),
        new PublicKey(publicKey).toBytes(),
      );
    }
    
    if (!isVerified) {
      await reportError(db, new Error(`Invalid signature (referralcode)! publicKey: ${publicKey}, message: ${message}, signature: ${signature}`))
      return jsonResponse(null, 401)
    }

    /// business logic
    // check if the user is stored in the db
    const existingUser = await UserService.findUserByAddress({ db, address: publicKey })

    if (!existingUser) {
      return jsonResponse({ message: "User not found" }, 404)
    }

    // Check if user already has a referral for this project
    const existingReferral = await db
      .prepare("SELECT * FROM referral WHERE project_id = ? AND address = ?")
      .bind(projectId, publicKey)
      .first()

    if (existingReferral) {
      return jsonResponse({ message: "Referral already exists for this project" }, 400)
    }

    // Find referrer by referral code
    const referrerAddress = await getAddressByReferralCode(db, referrerTwitterHandle);

    if (!referrerAddress) {
      return jsonResponse({ message: "Referrer not found" }, 404)
    }

    // Create new referral
    const referralId = uuidv4()
    await db
      .prepare("INSERT INTO referral (id, project_id, referrer_by, address, invested_dollar_value) VALUES (?, ?, ?, ?, ?)")
      .bind(referralId, projectId, referrerAddress, publicKey, 0)
      .run()

    // Update the user's JSON to include the referral code for this project
    const userJson = existingUser.json || {};
    
    // Initialize referralCode object if it doesn't exist
    if (!userJson.referralCode) {
      userJson.referralCode = {};
    }
    
    // Add or update the referral code for this project
    userJson.referralCode[projectId] = {
      code: referrerTwitterHandle,
      message: message,
      signature: signature
    };
    
    // Update the user in the database
    await db
      .prepare("UPDATE user SET json = ? WHERE address = ?")
      .bind(JSON.stringify(userJson), publicKey)
      .run();

    return jsonResponse(null, 204)
  } catch (e) {
    await reportError(db, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}

// Endpoint to get a user's referral code
export const onRequestGet: PagesFunction<ENV> = async (ctx) => {
  const db = ctx.env.DB
  try {
    const url = new URL(ctx.request.url)
    const address = url.searchParams.get("address")
    const projectId = url.searchParams.get("projectId")

    if (!address) {
      return jsonResponse({ message: "Address is required" }, 400)
    }

    // Check if the user exists
    const existingUser = await UserService.findUserByAddress({ db, address })
    if (!existingUser) {
      return jsonResponse({ message: "User not found" }, 404)
    }

    // Get the referral code for the user
    let code = getReferralCode(address);

    // Order all the referrals for the leaderboard by invested_dollar_value grouped by referrer_by
    const leaderboardReferrals = await db
      .prepare(`
        SELECT SUBSTR(referrer_by, 1, 4) AS referrer_by, SUM(invested_dollar_value) AS total_invested
        FROM referral
        WHERE project_id = ?
        GROUP BY referrer_by
        ORDER BY total_invested DESC
      `)
      .bind(projectId)
      .all();

    console.log("leaderboardReferrals", leaderboardReferrals.results);

    // Get all the referrals with the same address for referrer_by
    const referralsTable = await db
    .prepare(`
      SELECT referrer_by, SUBSTR(address, 1, 4) AS address, invested_dollar_value
      FROM referral
      WHERE project_id = ? AND referrer_by = ?
      GROUP BY address
      ORDER BY invested_dollar_value DESC
    `)
    .bind(projectId, address)
    .all();

    console.log("referralsTable", referralsTable.results);

    // Get the sum of invested_dollar_value for the same address for referrer_by
    const totalTickets = await db
    .prepare(`
      SELECT referrer_by, SUM(invested_dollar_value) AS total_invested
      FROM referral
      WHERE project_id = ? AND referrer_by = ?
      GROUP BY address
      ORDER BY total_invested DESC
    `)
    .bind(projectId, address)
    .all();

    console.log("totalTickets", totalTickets.results);

    // Get the sum of invested_dollar_value for the same address for referrer_by
    const totalTicketsDistributed = await db
    .prepare(`
      SELECT SUM(invested_dollar_value) AS total_invested
      FROM referral
      WHERE project_id = ?
    `)
    .bind(projectId)
    .all();

    console.log("totalTicketsDistributed", totalTicketsDistributed.results);

    return jsonResponse(
      { 
        code, 
        leaderboardReferrals: leaderboardReferrals.results, 
        referralsTable: referralsTable.results, 
        totalTickets: totalTickets.results,
        totalTicketsDistributed: totalTicketsDistributed.results
      }, 200);
  } catch (e) {
    await reportError(db, e);
    return jsonResponse({ message: "Something went wrong..." }, 500);
  }
}