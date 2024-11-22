// /server/api/chat.post.ts
import Anthropic from "@anthropic-ai/sdk";
import { messageRequest } from "~/server/api/validations/chat";
import type { H3Event } from "h3";
import { eq, and, inArray, desc } from "drizzle-orm";
import { threads, messages, files, logs } from "~/server/database/schema";
import db from "~/server/utils/db";

const MAX_MESSAGES = 4;

export default defineEventHandler(async (event: H3Event) => {
  try {
    const session = await requireUserSession(event);
    const { anthropicKey } = useRuntimeConfig();

    if (!anthropicKey) {
      throw createError({
        statusCode: 500,
        message: "Anthropic API key is not configured",
      });
    }

    const body = messageRequest.parse(await readBody(event));
    const anthropic = new Anthropic({ apiKey: anthropicKey });

    // Get thread
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

    // Insert user message
    await db.insert(messages).values({
      content: body.prompt,
      role: "user",
      createdAt: new Date(),
      threadId: body.threadId,
      userId: session.user.id,
    });

    // Fetch previous messages
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

    if (body.selectedFiles?.length > 0) {
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

    // Create response headers for SSE
    setResponseHeaders(event, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    const stream = await anthropic.beta.promptCaching.messages.create({
      model: thread.model || "claude-3-5-sonnet-latest",
      max_tokens: thread.maxTokens || 1024,
      messages: processedMessages,
      temperature: thread.temperature || 0.5,
      system: systemMessage,
      stream: true,
    });

    let fullResponse = "";

    // Stream the response
    for await (const chunk of stream) {
      if (chunk.type === "content_block_delta") {
        fullResponse += chunk.delta?.text || "";
        // Send chunk to client
        event.node.res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }

      if (chunk.type === "message_start") {
        await db.insert(logs).values({
          inputTokens: chunk.message.usage.input_tokens,
          outputTokens: chunk.message.usage.output_tokens,
          cacheCreationInputTokens:
            chunk.message.usage.cache_creation_input_tokens,
          cacheReadInputTokens: chunk.message.usage.cache_read_input_tokens,
          createdAt: new Date(),
          userId: session.user.id,
        });
      }
    }

    if (fullResponse.length > 0) {
      // Insert complete message to database
      await db.insert(messages).values({
        content: fullResponse,
        role: "assistant",
        createdAt: new Date(),
        threadId: body.threadId,
        userId: session.user.id,
      });
    }
    // Close the stream
    event.node.res.end();
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
