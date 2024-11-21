import Anthropic from "@anthropic-ai/sdk";
import { messageRequest } from "~/server/api/validations/chat";
import type { H3Event } from "h3";
import { eq, and, inArray, desc } from "drizzle-orm";
import { threads, messages, files, logs } from "~/server/database/schema";
import db from "~/server/utils/db";

const MAX_MESSAGES = 4;

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Require a user session (send back 401 if no `user` key in session)
    const session = await requireUserSession(event);

    // Get configuration and request body
    const { anthropicKey } = useRuntimeConfig();
    if (!anthropicKey) {
      throw createError({
        statusCode: 500,
        message: "Anthropic API key is not configured",
      });
    }

    // Parse and validate request body using Zod
    const body = messageRequest.parse(await readBody(event));
    // Initialize Anthropic client
    const anthropic = new Anthropic({ apiKey: anthropicKey });

    // Get thread using Drizzle
    const [thread] = await db
      .select()
      .from(threads)
      .where(eq(threads.id, body.threadId));

    if (!thread) {
      throw createError({
        statusCode: 404,
        message: "Thread not found",
      });
    }

    // Insert user message using Drizzle
    await db.insert(messages).values({
      content: body.prompt,
      role: "user",
      createdAt: new Date(),
      threadId: body.threadId,
      userId: session.user.id,
    });

    // Fetch last MAX_MESSAGES from the database
    const dbMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.threadId, body.threadId))
      .orderBy(desc(messages.createdAt))
      .limit(MAX_MESSAGES);

    const processedMessages = preprocessMessages(dbMessages);


    const systemMessage = [
      {
        type: "text",
        text: thread.systemMessage || "You are a helpful assistant",
        cache_control: { type: "ephemeral" },
      },
    ];

    if (body.selectedFiles && body.selectedFiles.length > 0) {
      // Retrieve text from files using Drizzle
      const selectedFiles = await db
        .select({
          name: files.name,
          text: files.text,
        })
        .from(files)
        .where(
          and(
            eq(files.threadId, body.threadId),
            inArray(files.id, body.selectedFiles)
          )
        );

      for (const file of selectedFiles) {
        systemMessage.push({
          type: "text",
          text: file.text,
          cache_control: { type: "ephemeral" },
        });
      }
    }

    // Make API call
    const response = await anthropic.beta.promptCaching.messages.create({
      model: thread.model || "claude-3-5-sonnet-latest",
      max_tokens: thread.maxTokens || 1024,
      messages: processedMessages,
      temperature: thread.temperature || 0.5,
      system: systemMessage,
    });

    // Insert assistant message using Drizzle
    await db.insert(messages).values({
      content: response.content[0].text,
      role: "assistant",
      createdAt: new Date(),
      threadId: body.threadId,
      userId: session.user.id,
    });

    // Save logs
    await db.insert(logs).values({
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      cacheCreationInputTokens: response.usage.cache_creation_input_tokens,
      cacheReadInputTokens: response.usage.cache_read_input_tokens,
      createdAt: new Date(),
      userId: session.user.id,
    });

    return response;
  } catch (error) {
    console.error("Error in Anthropic API handler:", error);

    throw createError({
      statusCode: error.status || 500,
      message: error.message || "Internal server error",
    });
  }
});

function preprocessMessages(messages: any[]) {
  return messages
    .map(({ role, content }: any) => ({ role, content }))
    .slice(-MAX_MESSAGES);
}
