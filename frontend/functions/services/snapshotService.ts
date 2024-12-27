import { DrizzleD1Database } from "drizzle-orm/d1/driver"
import { EligibilityStatus } from "../../shared/eligibilityModel"
import { eligibilityStatusSnapshotTable } from "../../shared/drizzle-schema"
import { and, eq } from "drizzle-orm"

type GetSnapshotArgs = {
  db: DrizzleD1Database
  address: string
  projectId: string
}
const getSnapshot = async ({ db, address, projectId }: GetSnapshotArgs): Promise<EligibilityStatus | null> => {
  const snapshot = await db
    .select()
    .from(eligibilityStatusSnapshotTable)
    .where(
      and(
        eq(eligibilityStatusSnapshotTable.address, address),
        eq(eligibilityStatusSnapshotTable.projectId, projectId)
      )
    )
    .get()

  if (!snapshot) return null

  return { snapshotTakenAt: snapshot.createdAt, ...snapshot.eligibilityStatus }
}

type CreateSnapshotArgs = GetSnapshotArgs & {
  eligibilityStatus: EligibilityStatus
}
/**
 * Creates an eligibility status snapshot for the address/project combination in the db.
 * Checks if it exists
 * @param db
 * @param address
 * @param projectId
 * @param eligibilityStatus
 */
const createSnapshot = async ({ db, address, projectId, eligibilityStatus }: CreateSnapshotArgs): Promise<void> => {
  // we take snapshot one time only
  const existingSnapshot = await getSnapshot({ db, address, projectId })
  if (existingSnapshot) return

  await db.insert(eligibilityStatusSnapshotTable).values({
    address, projectId, eligibilityStatus, createdAt: (new Date().toISOString()),
  })
}

export const SnapshotService = {
  getSnapshot,
  createSnapshot,
}
