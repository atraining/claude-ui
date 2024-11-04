import Anthropic from "@anthropic-ai/sdk";

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

  try {
    const formData = await readMultipartFormData(event);

    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        message: "No files received",
      });
    }

    const fileData = formData.find((item) => item.name === "file");

    if (!fileData) {
      throw createError({
        statusCode: 400,
        message: "File data not found",
      });
    }

    const tokens = await anthropic.beta.messages.countTokens({
      model: "claude-3-5-sonnet-20241022",
      messages: [
        {
          role: "user",
          content: fileData.data.toString(),
        },
      ],
    });

    const fileQuery = await db
      .prepare(
        "INSERT INTO files (name, path, text , tokens , created_at , thread_id) VALUES ( ?, ?, ?, ?, ?, ?)"
      )
      .bind(
        ...[
          fileData.filename,
          fileData.filename,
          fileData.data.toString(),
          tokens.input_tokens,
          Date.now(),
          threadId,
        ]
      )
      .run();

    return {
      threadId,
      last_row_id : fileQuery.meta.last_row_id,
      file: {
        filename: fileData.filename,
        type: fileData.type,
        tokens: tokens.input_tokens,
        size: fileData.data.length,
        content: fileData.data,
      },
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Error processing file upload",
    });
  }
});
