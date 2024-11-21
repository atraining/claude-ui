import db from "~/server/utils/db";
import { eq } from "drizzle-orm";
import { users } from "~/server/database/schema";
import bcrypt from "bcrypt";
import { signUpRequest } from "~/server/api/validations/auth";

export default defineEventHandler(async (event) => {
  try {
    const body = signUpRequest.parse(await readBody(event));

    // Check if the user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, body.email));

    if (existingUser.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "User already exists",
      });
    }

    // Hash the password and create a new user
    const hashedPassword = await bcrypt.hash(body.password, 10);

    await db.insert(users).values({
      email: body.email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    return { message: "User created successfully" };
  } catch (error) {
    // Log the error for debugging
    console.error("Error in auth.signup handler:", error);

    // Return a consistent error response
    if (error.data) {
      throw createError({
        statusCode: error.statusCode || 400,
        message: error.statusMessage || "Validation error",
        data: error.data,
      });
    }

    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Internal server error",
    });
  }
});
