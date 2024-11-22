import db from "~/server/utils/db";
import { eq, count, desc } from "drizzle-orm";
import { logs } from "~/server/database/schema";

export default defineEventHandler(async (event) => {
  // Require a user session (send back 401 if no `user` key in session)
  const session = await requireUserSession(event);

  // Get pagination parameters from query
  const query = getQuery(event);
  const page = Math.max(1, parseInt(query.page as string) || 1);
  const pageSize = Math.max(
    1,
    Math.min(100, parseInt(query.pageSize as string) || 10),
  );
  const offset = (page - 1) * pageSize;

  // Get total count for pagination
  const [{ value: totalCount }] = await db
    .select({ value: count() })
    .from(logs)
    .where(eq(logs.userId, session.user.id));

  // Get paginated results
  const items = await db
    .select()
    .from(logs)
    .where(eq(logs.userId, session.user.id))
    .limit(pageSize)
    .offset(offset)
    .orderBy(desc(logs.id));

  return {
    items,
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      hasNextPage: page * pageSize < totalCount,
      hasPreviousPage: page > 1,
    },
  };
});
