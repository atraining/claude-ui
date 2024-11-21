import db from "~/server/utils/db";
import { eq } from "drizzle-orm";
import { users } from "~/server/database/schema";
import bcrypt from "bcrypt";
import { signInRequest } from "~/server/api/validations/auth";

export default defineEventHandler(async (event) => {
  try {
    const body = signInRequest.parse(await readBody(event));

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, body.email));

    if (!user || !(await bcrypt.compare(body.password, user.password))) {
      throw createError({
        statusCode: 401,
        statusMessage: "Invalid username or password",
      });
    }

    const session = {
      user: {
        email: user.email,
        id: user.id,
      },
      loggedInAt: new Date(),
    };

    await setUserSession(event, session);

    return { message: "Logged in successfully" };
  } catch (error) {
    throw error;
  }
});
