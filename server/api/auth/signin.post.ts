import db from "~/server/utils/db";
import { eq } from "drizzle-orm";
import { users } from "~/server/database/schema";
import bcrypt from "bcrypt";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    if (!body) {
      throw createError({
        statusCode: 400,
        statusMessage: "Request body is empty or undefined",
      });
    }

    const { email, password } = body;

    if (!email || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: "Username and password are required",
      });
    }

    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw createError({
        statusCode: 401,
        statusMessage: "Invalid username or password",
      });
    }

    const session = {
      user: {
        email: user.email,
        id: user.id
      },
      loggedInAt: new Date(),
    }

    await setUserSession(event, session)

    return { message: "Logged in successfully" };
  } catch (error) {
    throw error;
  }
});

