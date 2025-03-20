import { AnalystType } from "../../shared/models"

type AnalystWithTwitterAccountArgs = {
  db: D1Database
  twitterId: string
}
const findAnalystByTwitterAccount = async ({ db, twitterId }: AnalystWithTwitterAccountArgs): Promise<AnalystType | null> => {
  const analyst = await db
    .prepare("SELECT * FROM analyst WHERE address = ?1")
    .bind(twitterId)
    .first<AnalystType | null>()

  if (!analyst) return null

  return analyst
}
const createNewAnalyst = async ({db, twitterId}: AnalystWithTwitterAccountArgs): Promise<boolean> => {
    console.log("createNewAnalyst");
    console.log(twitterId);
    
    return true
}

export const AnalystService = {
    createNewAnalyst,
    findAnalystByTwitterAccount
}
