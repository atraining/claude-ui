import db from "~/server/utils/db";
import { threads } from "~/server/database/schema";
import { createThreadRequest } from "~/server/api/validations/thread";

export default defineEventHandler(async (event) => {
  try {
    // Require a user session (send back 401 if no `user` key in session)
    const session = await requireUserSession(event);
    const body = createThreadRequest.parse(await readBody(event));
    const stmt = await db.insert(threads).values({
      name: body.name,
      systemMessage: body.systemMessage,
      temperature: body.temperature,
      model: body.model,
      maxTokens: body.maxTokens,
      createdAt: new Date(),
      userId: session.user.id,
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
