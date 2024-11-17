import db from "~/server/utils/db";
import { eq } from "drizzle-orm";
import { files } from "~/server/database/schema";

export default defineEventHandler(async (event) => {
  try {
    // Require a user session (send back 401 if no `user` key in session)
    const session = await requireUserSession(event);

    const id = event.context.params.id;

    // check if user is the owner of the thread
    if (id) {
      const [file] = await db.select().from(files).where(eq(files.id, id));
      if (!file) {
        throw createError({
          statusCode: 404,
          message: "File not found",
        });
      }
      if (file.userId !== session.user.id) {
        throw createError({
          statusCode: 403,
          message: "You are not authorized to delete this file",
        });
      }

      const result = await db.delete(files).where(eq(files.id, id));

      return { deleted: result.rowsAffected };
    }
  } catch (error) {
    console.error("Error in files.delete handler:", error);
    throw createError({
      statusCode: error.status || 500,
      message: error.message || "Internal server error",
    });
  }
});
