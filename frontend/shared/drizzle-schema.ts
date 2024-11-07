import { primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { ProjectModel, UserModelJson } from "./models"

export const whitelistTable = sqliteTable('whitelist', {
  address: text().notNull(),
  projectId: text('project_id').notNull(),
  tierId: text('tier_id').notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.address, table.projectId] }),
  };
})

export const userTable = sqliteTable('user', {
  address: text().primaryKey(),
  json: text({ mode: 'json' }).notNull().$type<UserModelJson>()
})

export const projectTable = sqliteTable('project', {
  id: text().primaryKey(),
  json: text({ mode: 'json' }).notNull().$type<ProjectModel>()
})

export const followerTable = sqliteTable('follower', {
  id: text().primaryKey(),
  json: text({ mode: 'json' }).notNull()
})

export const nftIndexTable = sqliteTable('nft_index', {
  nftAddress: text('nft_address').primaryKey(),
  collectionAddress: text('collection_address'),
  ownerAddress: text('owner_address'),
  quotedAt: text('quoted_at'),
  json: text({ mode: 'json' }).notNull()
})

// const db = drizzle()
// db
//   .select()
//   .from(whitelistTable)
//   .where(eq(whitelistTable.address, ))
