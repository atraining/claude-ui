import Anthropic from "@anthropic-ai/sdk";
import type { H3Event } from "h3";
import { eq, and, inArray } from "drizzle-orm";
import { threads, messages, files } from "~/server/database/schema";
import db from "~/server/utils/db";

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
}

const MAX_MESSAGES = 4;

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Require a user session (send back 401 if no `user` key in session)
    const session = await requireUserSession(event);

    // Get configuration and request body
    const { anthropicKey } = useRuntimeConfig();

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: anthropicKey,
    });

    if (!anthropicKey) {
      throw createError({
        statusCode: 500,
        message: "Anthropic API key is not configured",
      });
    }

    const body = await readBody(event);
    const validatedMessages = validateMessages(body.messages);

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
      content: validatedMessages[validatedMessages.length - 1].content,
      role: "user",
      createdAt: new Date(),
      threadId: body.threadId,
    });

    // Process messages
    const processedMessages = preprocessMessages(validatedMessages);

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

function validateMessages(messages: any): Message[] {
  if (!Array.isArray(messages)) {
    throw createError({
      statusCode: 400,
      message: "Messages must be an array",
    });
  }

  if (messages.length === 0) {
    throw createError({
      statusCode: 400,
      message: "Messages array cannot be empty",
    });
  }

  return messages.map((message) => {
    if (!message.role || !message.content) {
      throw createError({
        statusCode: 400,
        message: "Each message must have role and content properties",
      });
    }
    return message;
  });
}

function preprocessMessages(messages: Message[]): Message[] {
  return messages
    .map(({ role, content }) => ({ role, content }))
    .slice(-MAX_MESSAGES);
}
