import db from '~/server/utils/db'
import { eq } from 'drizzle-orm'
import { threads, messages, files } from '~/server/database/schema'

export default defineEventHandler(async (event) => {
    try {
            // Require a user session (send back 401 if no `user` key in session)
    const session = await requireUserSession(event);

        const id = event.context.params.id;

        // Delete related records first (to maintain referential integrity)
        await db.delete(messages)
            .where(eq(messages.threadId, id));

        await db.delete(files)
            .where(eq(files.threadId, id));

        // Delete the thread last
        const result = await db.delete(threads)
            .where(eq(threads.id, id));

        return { deleted: result.rowsAffected };
    } catch (error) {
        console.error("Error in threads.delete handler:", error);
        throw createError({
            statusCode: error.status || 500,
            message: error.message || "Internal server error",
        });
    }
});