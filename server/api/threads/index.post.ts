import db from "~/server/utils/db";
import { threads } from '~/server/database/schema';

export default defineEventHandler(async (event) => {
  try {
        // Require a user session (send back 401 if no `user` key in session)
        const session = await requireUserSession(event);

    const { name, systemMessage, temperature , model , maxTokens } = await readBody(event);
    const stmt = await  db.insert(threads).values({
      name : name,
      systemMessage: systemMessage,
      temperature: temperature,
      model: model,
      maxTokens: maxTokens,
      createdAt: new Date(),
    });
    return {
      id: stmt.lastInsertRowid,
    };
  } catch (error) {
    console.error("Error in threads.post handler:", error);
    throw createError({
      statusCode: error.status || 500,
      message: error.message || "Internal server error",
    });
  }
});
