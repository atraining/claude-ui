import db from "~/server/utils/db";
import { eq } from "drizzle-orm";
import { users } from "~/server/database/schema";
import bcrypt from "bcrypt";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event); // Retrieve request body
    if (!body) {
      return { error: "Request body is empty or undefined" };
    }

    const { email, password } = body;

    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (user.length > 0) {
      return { error: "User already exists"};
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.insert(users).values({
      email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    return { message: "User created successfully" };
  } catch (error) {
    console.error("Error in auth.signup handler:", error);
    throw createError({
      statusCode: error.status || 500,
      message: error.message || "Internal server error",
    });
  }
});
