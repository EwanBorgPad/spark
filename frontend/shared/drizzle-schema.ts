import { primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { ProjectModel, UserModelJson } from "./models"
// import { drizzle } from "drizzle-orm/d1"
// import { eq } from "drizzle-orm"

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

// const db = drizzle()
// db
//   .select()
//   .from(whitelistTable)
//   .where(eq(whitelistTable.address, ))
