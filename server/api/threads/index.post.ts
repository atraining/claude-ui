export default defineEventHandler(async (event) => {
  try {
    const db = hubDatabase();
    const { name, systemMessage, temperature , model , maxTokens } = await readBody(event);
    const stmt = await db
      .prepare(
        "INSERT INTO threads (name, system_message, created_at , temperature , model , max_tokens) VALUES ( ?, ?, ?, ?, ?, ?)"
      )
      .bind(name, systemMessage, Date.now(), temperature , model , maxTokens )
      .run();
    return stmt.meta;
  } catch (error) {
    console.error("Error in threads.post handler:", error);
    throw createError({
      statusCode: error.status || 500,
      message: error.message || "Internal server error",
    });
  }
});
