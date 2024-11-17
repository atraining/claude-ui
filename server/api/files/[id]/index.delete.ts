import db from "~/server/utils/db";
import { eq } from "drizzle-orm";
import { files } from "~/server/database/schema";

export default defineEventHandler(async (event) => {
  try {
    // Require a user session (send back 401 if no `user` key in session)
    const session = await requireUserSession(event);

    const id = event.context.params.id;

    const result = await db.delete(files).where(eq(files.id, id));

    return { deleted: result.rowsAffected };
  } catch (error) {
    console.error("Error in files.delete handler:", error);
    throw createError({
      statusCode: error.status || 500,
      message: error.message || "Internal server error",
    });
  }
});
