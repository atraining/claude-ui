export default defineEventHandler(async (event) => {
  try {
    const db = hubDatabase();
    const threadId = event.context.params.threadId;
    const stmt = db.prepare("SELECT * FROM messages  WHERE thread_id = ? ORDER BY created_at")
    .bind(threadId)
    const messages = await stmt.all();
    return messages.results;
  } catch (error) {
    console.error("Error in messages.get handler:", error);
    throw createError({
      statusCode: error.status || 500,
      message: error.message || "Internal server error",
    });
  }
});
