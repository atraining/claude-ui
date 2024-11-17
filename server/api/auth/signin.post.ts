import db from "~/server/utils/db";
import { eq } from "drizzle-orm";
import { users } from "~/server/database/schema";
import bcrypt from "bcrypt";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event); // Retrieve request body
    if (!body) {
      console.error("Request body is empty or undefined");
      return createError({
        statusCode: 400,
        statusMessage: "Request body is empty or undefined",
      });
    }

    const { email, password } = body;

    if (!email || !password) {
      console.error("Username or password missing");
      return createError({
        statusCode: 400,
        statusMessage: "Username and password are required",
      });
    }

    const [user]  = await db.select().from(users).where(eq(users.email, email));
    if (!user || !(await bcrypt.compare(password, user.password))) {
      console.error(`Invalid username or password for user: ${email}`);
      return createError({
        statusCode: 401,
        statusMessage: "Invalid username or password",
      });
    } else {
      const userData = {
         email: user.email,
         id: user.id
        };
      await setUserSession(event, {
        user: userData,
        loggedInAt: new Date(),
      });
    }

    return { success: true, message: "Login successful" };
  } catch (error) {
    console.error("Error handling login request:", error);
    return createError({
      statusCode: 500,
      statusMessage: "Failed to process request",
    });
  }
});
