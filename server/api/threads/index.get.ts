export default defineEventHandler(async (event) => {
    try {
      const db = hubDatabase();
    
      const stmt = await db.prepare("SELECT id, name FROM threads ORDER BY created_at DESC").all();
      return stmt.results;
    } catch (error) {
      console.error("Error in threads.get handler:", error);
      throw createError({
        statusCode: error.status || 500,
        message: error.message || "Internal server error",
      });
    }
  });