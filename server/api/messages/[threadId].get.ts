import db from "~/server/utils/db";
import { eq } from "drizzle-orm";
import { messages , threads } from "~/server/database/schema";

export default defineEventHandler(async (event) => {
  try {
    // Require a user session (send back 401 if no `user` key in session)
    const session = await requireUserSession(event);

    const threadId = event.context.params.threadId;

    // check if user is the owner of the thread
    const [thread] = await db
      .select()
      .from(threads)
      .where(eq(threads.id, threadId));
    if (!thread) {
      throw createError({
        statusCode: 404,
        message: "Thread not found",
      });
    }
    if (thread.userId !== session.user.id) {
      throw createError({
        statusCode: 403,
        message: "You are not authorized to access this thread",
      });
    }

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
