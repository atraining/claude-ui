export default defineEventHandler(async (event) => {
  try {
    const db = hubDatabase();
    const id = event.context.params.id;
    const stmt = await db.prepare("DELETE FROM files WHERE id = ?").bind(id).run();
    return stmt.changes;
  } catch (error) {
    console.error("Error in files.delete handler:", error);
    throw createError({
      statusCode: error.status || 500,
      message: error.message || "Internal server error",
    });
  }
})
