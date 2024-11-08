import Anthropic from "@anthropic-ai/sdk";
import { parseFile } from "~/server/utils/fileParser";

export default defineEventHandler(async (event) => {
  // Get configuration and request body
  const { anthropicKey } = useRuntimeConfig();
  const db = hubDatabase();
  // Initialize Anthropic client
  const anthropic = new Anthropic({
    apiKey: anthropicKey,
  });

  // Get thread ID from URL parameters
  const threadId = event.context.params.id;

  const formData = await readMultipartFormData(event);

  for (const field of formData) {
    if (!field.data || !field.filename) continue;
    try {
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

      const fileQuery = await db
        .prepare(
          "INSERT INTO files (name, path, text , tokens , created_at , thread_id) VALUES ( ?, ?, ?, ?, ?, ?)"
        )
        .bind(
          ...[
            field.filename,
            field.filename,
            text,
            tokens.input_tokens,
            Date.now(),
            threadId,
          ]
        )
        .run();

      return {
        threadId,
        last_row_id: fileQuery.meta.last_row_id,
        file: {
          filename: field.filename,
          type: field.type,
          tokens: tokens.input_tokens,
          size: field.data.length,
        },
      };
    } catch (error) {
      console.error("Error parsing file:", error);
      throw createError({
        statusCode: 500,
        message: "Error parsing file",
      });
    }
  }
});
