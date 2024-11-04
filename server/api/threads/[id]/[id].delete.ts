

export default defineEventHandler(async (event) => {
    try {
        const db = hubDatabase();
        const id = event.context.params.id;
        const stmt = await db.prepare("DELETE FROM threads WHERE id = ?").bind(id).run();
        // delete from messages where thread_id = ?
        const stmt2 = await db.prepare("DELETE FROM messages WHERE thread_id = ?").bind(id).run();
        return stmt.changes;
    } catch (error) {
        console.error("Error in threads.delete handler:", error);
        throw createError({
            statusCode: error.status || 500,
            message: error.message || "Internal server error",
        });
    }
});