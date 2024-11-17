import db from "~/server/utils/db";
import { eq } from "drizzle-orm";
import { threads, messages, files } from "~/server/database/schema";

export default defineEventHandler(async (event) => {
  try {
    // Require a user session (send back 401 if no `user` key in session)
    const session = await requireUserSession(event);
    const id = event.context.params.id;

    let userId = session.user.id;
    // check if user is the owner of the thread
    if (event.context.params.id) {
      const [thread] = await db
        .select()
        .from(threads)
        .where(eq(threads.id, id));
      if (!thread) {
        throw createError({
          statusCode: 404,
          message: "Thread not found",
        });
      }
      userId = thread.userId;
    }


    // Delete related records first (to maintain referential integrity)
    await db.delete(messages).where(eq(messages.threadId, id));
    // Delete files
    await db.delete(files).where(eq(files.threadId, id));
    // Delete the thread last
    const result = await db.delete(threads).where(eq(threads.id, id));
    return { deleted: result.rowsAffected };
  } catch (error) {
    console.error("Error in threads.delete handler:", error);
    throw createError({
      statusCode: error.status || 500,
      message: error.message || "Internal server error",
    });
  }
});
