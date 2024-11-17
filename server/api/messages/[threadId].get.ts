import db from "~/server/utils/db";
import { eq } from "drizzle-orm";
import { messages } from "~/server/database/schema";

export default defineEventHandler(async (event) => {
  try {
    // Require a user session (send back 401 if no `user` key in session)
    const session = await requireUserSession(event);

    const threadId = event.context.params.threadId;

    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.threadId, threadId))
      .orderBy(messages.createdAt);

    return msgs;
  } catch (error) {
    console.error("Error in messages.get handler:", error);
    throw createError({
      statusCode: error.status || 500,
      message: error.message || "Internal server error",
    });
  }
});
