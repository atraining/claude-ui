import db from "~/server/utils/db";

export default defineEventHandler(async (event) => {
  try {
    // First get threads with basic info
    const threads = await db.all(
      `
        SELECT 
          t.id,
          t.name,
          (
            SELECT json_group_array(
              json_object(
                'id', f.id,
                'name', f.name,
                 'tokens', f.tokens
              )
            )
            FROM files f
            WHERE f.thread_id = t.id
          ) as files
        FROM threads t
        ORDER BY t.created_at DESC
      `
    );

    // Parse the JSON string in files column
    return threads.map((thread) => ({
      ...thread,
      files: JSON.parse(thread.files || "[]"),
    }));
  } catch (error) {
    console.error("Error in threads.get handler:", error);
    throw createError({
      statusCode: error.status || 500,
      message: error.message || "Internal server error",
    });
  }
});
