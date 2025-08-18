import Anthropic from "@anthropic-ai/sdk";
import { parseFile } from "~/server/utils/fileParser";
import db from "~/server/utils/db";
import { files } from "~/server/database/schema";

export default defineEventHandler(async (event) => {
  try {
    // Require a user session (send back 401 if no `user` key in session)
    const session = await requireUserSession(event);

    // Get configuration and request body
    const { anthropicKey } = useRuntimeConfig();

    if (!anthropicKey || anthropicKey === "your_anthropic_api_key_here") {
      throw createError({
        statusCode: 500,
        message:
          "Anthropic API key is not configured. Please set the ANTHROPIC_KEY environment variable.",
      });
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: anthropicKey,
    });

    // Get thread ID from URL parameters
    const threadId = event.context.params.id;

    const formData = await readMultipartFormData(event);

    for (const field of formData) {
      if (!field.data || !field.filename) continue;

      const text = await parseFile(field.filename, field.data, field.type);

      const tokens = await anthropic.beta.messages.countTokens({
        model: "claude-3-5-sonnet-20241022",
        messages: [
          {
            role: "user",
            content: text,
          },
        ],
      });

      // Insert file using Drizzle
      const [insertedFile] = await db
        .insert(files)
        .values({
          name: field.filename,
          path: field.filename,
          text: text,
          tokens: tokens.input_tokens,
          createdAt: new Date(),
          threadId: threadId,
          userId: session.user.id,
        })
        .returning({ id: files.id }); // Return the inserted ID

      return {
        threadId,
        last_row_id: insertedFile.id,
        file: {
          filename: field.filename,
          type: field.type,
          tokens: tokens.input_tokens,
          size: field.data.length,
        },
      };
    }
  } catch (error) {
    console.error("Error parsing file:", error);
    throw createError({
      statusCode: 500,
      message: error.message || "Error parsing file",
    });
  }
});
